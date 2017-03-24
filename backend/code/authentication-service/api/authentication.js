import set_seconds from 'date-fns/set_seconds'
import { http, errors } from 'web-service'
import uuid from 'uuid'

import store from '../store'
import Throttling from '../../common/throttling'
import start_metrics from '../../../../code/metrics'
import get_word from '../dictionaries/dictionary'

const access_code_lifetime = 24 * 60 * 60 * 1000 // a day (about 20 attempts)
const access_code_max_attempts = 10

const throttling = new Throttling(store)

const metrics = start_metrics
({
	statsd:
	{
		...configuration.statsd,
		prefix : 'authentication'
	}
})

export default function(api)
{
	// Returns user's authentication configuration
	api.get('/info', async function({}, { user })
	{
		const authentications = []

		const password_authentication = await store.get_user_authentication(user.id, 'password')

		if (password_authentication)
		{
			authentications.push({ type: 'password' })
		}

		return authentications
	})

	// Performs an authentication step of a multifactor authentication
	api.post('/', async function({ multifactor_authentication_id, id, value })
	{
		const multifactor_authentication = await store.get_multifactor_authentication(multifactor_authentication_id)

		const authentication = await store.get(id)

		if (!multifactor_authentication || !authentication)
		{
			throw new errors.Not_found()
		}

		const check = authentication_checker(authentication.type)

		// Check if the authentication expired
		if (authentication.expires && authentication.expires.getTime() <= Date.now())
		{
			throw new errors.Access_denied('Authentication expired')
		}

		// If maximum tries count reached
		if (authentication.attempts_left === 0)
		{
			throw new errors.Access_denied('Maximum tries count reached')
		}

		const { throttled, cooldown, result } = await throttling.attempt(multifactor_authentication, async () =>
		{
			// If the authentication value doesn't match
			if (!await check(value, authentication.value))
			{
				// Decrement attempts left
				if (authentication.attempts_left !== null)
				{
					await store.update(authentication.id,
					{
						attempts_left: authentication.attempts_left - 1
					})
				}

				// No match
				return
			}

			// Authentication matches

			// Clean up verified access codes
			if (authentication.type === 'access code')
			{
				await store.delete(id)
			}

			// Remove this authentication from multifactor authentication items list
			const pending = await store.update_multifactor_authentication_being_authenticated(multifactor_authentication.id, id)

			// Activate the next authentication
			if (pending)
			{
				await activate_authentication(multifactor_authentication.id, pending, multifactor_authentication.user, multifactor_authentication.action)
			}

			return pending || true
		})

		if (throttled)
		{
			metrics.increment('invalid')
			throw new errors.Access_denied('Access code attempts limit exceeded', { cooldown })
		}

		if (!result)
		{
			throw new errors.Input_rejected('No match')
		}

		// Return pending authentications list (or `undefined` if nothing's pending)

		if (result === true)
		{
			return
		}

		return public_pending_authentications(result)
	})

	// Authenticates a user with things like a password and an access code
	api.post('/authenticate', async function(input, { user, internal_http })
	{
		const { using, action, extra } = input

		// Get user's private info required for authentication purposes
		if (user)
		{
			user = await internal_http.get(address_book.user_service)
		}
		else
		{
			user = input.user
		}

		// Check unfinished multifactor authentications for this user
		let multifactor_authentication = await store.get_user_multifactor_authentication(user.id, action)

		// Limit authentication request frequency for a user.
		// (A finished multifactor authentication gets deleted right away)
		if (multifactor_authentication)
		{
			// Check that there's room for 2 attempts,
			// one of which is immediately "failed" here
			// to throttle things like sending access codes.
			const { throttled, cooldown } = await throttling.attempt(multifactor_authentication, { count: 2 })

			if (throttled)
			{
				metrics.increment('invalid')
				throw new errors.Access_denied('Authentication attempts limit exceeded', { cooldown })
			}

			// Update the new penalized temperature, etc
			multifactor_authentication = await store.get_multifactor_authentication(multifactor_authentication.id)

			// There can only be one multifactor authentication pending
			// for a given `action` (for simplicity).
			await store.delete_multifactor_authentication(multifactor_authentication.id)
		}

		// Collect authentications for the new multifactor authentication

		let authentications

		switch (action)
		{
			case 'change email':
				authentications = using
				for (const authentication of authentications)
				{
					await fill_in_authentication(authentication, user)
				}
				break

			default:
				authentications = await choose_authentications(user, using)
		}

		// Report stats
		metrics.increment('count')

		// Create multifactor authentication.
		// (UUID v4 collision is extremely unlikely
		//  so even not handling it here
		//  though it is quite trivial and could be done if needed)
		const id = uuid.v4()
		await store.create_multifactor_authentication(id, user.id, action, extra, authentications, multifactor_authentication)

		// Activate the first authentication
		await activate_authentication(id, authentications, user.id, action)

		// Return multifactor authentication info
		const result =
		{
			id,
			action,
			pending: public_pending_authentications(authentications)
		}

		return result
	})

	// Returns multifactor authentication info,
	// deleting it from the database if it succeeded.
	// If it has not, returns `undefined`.
	api.get('/:id', async function({ id })
	{
		const multifactor_authentication = await store.get_multifactor_authentication(id)

		// Not throwing "404 Not found" error here to prevent hacking attempts
		// (e.g. when an attacker finds a non-404 endpoint and keeps fetching it
		//  until the user finishes the authentication process)
		if (!multifactor_authentication)
		{
			return
		}

		// If this authentication is still pending, then return nothing.
		if (multifactor_authentication.length > 0)
		{
			return
		}

		// If this authentication succeeded,
		// then delete it from the database and return its data.
		// (therefore a successful authentication can only be used once)
		await store.delete_multifactor_authentication(multifactor_authentication.id)

		// Check if this authentication succeeded, but expired since then.
		// Not throwing a "status 500" error here just because this error is
		// very unlikely and shouldn't ever happen so no need to handle it specifically.
		if (Date.now() >= multifactor_authentication.expires.getTime())
		{
			return
		}

		return multifactor_authentication
	})
}

// Generates access code
// (must only be called from throttled handlers)
async function generate_access_code(user_id, locale, medium, recepient, action)
{
	// Generate an access code

	const code = get_word(locale)

	const data =
	{
		user    : user_id,
		type    : 'access code',
		value   : code,
		expires : new Date(Date.now() + access_code_lifetime),
		attempts_left : access_code_max_attempts
	}

	const id = await store.create(data)

	// Deliver the access code to the user
	switch (medium)
	{
		case 'email':
			// Send the access code via email
			await http.post(`${address_book.mail_service}`,
			{
				to         : recepient,
				template   : 'code',
				locale     : locale,
				parameters :
				{
					code,
					action : action.replace(/\s/g, '_')
				}
			})
			break

		case 'phone':
			throw new Error('Sending access codes via SMS is not currently implemented')
			// await http.post(`${address_book.message_delivery_service}`,
			// {
			// 	medium     : 'phone',
			// 	to         : recepient,
			// 	template   : 'sign in code',
			// 	locale     : locale,
			// 	parameters :
			// 	{
			// 		code,
			// 		action : action.replace(/\s/g, '_')
			// 	}
			// })
			break

		default:
			throw new Error(`Unknown access code delivery medium: ${medium}`)
	}

	// Return access code id
	return id
}

// Sends an access code, for example
async function activate_authentication(multifactor_authentication_id, authentications, user_id, action)
{
	const authentication = authentications[0]

	switch (authentication.type)
	{
		case 'access code':
			// Generate access code
			authentication.id = await generate_access_code(user_id, authentication.locale, authentication.medium, authentication.recepient, action)
			break

		default:
			return
	}

	// Update multifactor authentication
	await store.update_multifactor_authentication_pending(multifactor_authentication_id, authentications)
}

// Creates authentication checking function:
// `(input, against) => Promise`
function authentication_checker(type)
{
	switch (type)
	{
		// If it's a password then hash it
		case 'password':
			return (input, against) =>
			{
				return http.get(`${address_book.password_service}/matches`,
				{
					password        : input,
					hashed_password : against
				})
			}

		default:
			return async (input, against) => input === against
	}
}

// Chooses a sufficient amount of authentications based on preferences
async function choose_authentications(user, using)
{
	const authentications = []

	let has_first_factor_authentication = false
	let has_second_factor_authentication = false

	const has_email = user.email
	const has_phone = user.phone
	const has_password = await store.get_user_authentication(user.id, 'password')

	for (const authentication of Object.clone(using))
	{
		switch (authentication.type)
		{
			case 'access code':
				// Only if `recepient` is not overridden
				// this authentication is considered a valid user authentication.
				// `recepient` may be overridden, say, when changing an email address.
				if (!authentication.recepient)
				{
					has_first_factor_authentication = true
				}
				authentications.push(await fill_in_authentication(authentication, user))
				break

			case 'password':
				has_second_factor_authentication = true
				authentications.push(await fill_in_authentication(authentication, user))
				break

			default:
				throw new Error(`Unknown authentication type: ${authentication.type}`)
		}
	}

	if (!has_first_factor_authentication)
	{
		if (has_email || has_phone)
		{
			authentications.push(await fill_in_authentication({ type : 'access code' }, user))
		}
	}

	if (!has_second_factor_authentication)
	{
		if (has_password)
		{
			authentications.push(await fill_in_authentication({ type: 'password' }, user))
		}
	}

	if (authentications.is_empty())
	{
		throw new Error('No authentications available for this user')
	}

	return authentications
}

async function fill_in_authentication(authentication, user)
{
	switch (authentication.type)
	{
		case 'access code':

			if (!authentication.medium)
			{
				if (user.email)
				{
					authentication.medium = 'email'
				}
				else if (user.phone)
				{
					authentication.medium = 'phone'
				}
				else
				{
					throw new Error('No authentication medium available for access code delivery')
				}
			}

			if (!authentication.recepient)
			{
				switch (authentication.medium)
				{
					case 'email':
						authentication.recepient = user.email
						break

					case 'phone':
						authentication.recepient = user.phone
						break

					default:
						throw new Error(`Unknown delivery medium ${authentication.medium}`)
				}
			}

			if (!authentication.locale)
			{
				authentication.locale = user.locale
			}

			break

		case 'password':

			const password = await store.get_user_authentication(user.id, 'password')

			if (!password)
			{
				throw new Error('The user has no password set up')
			}

			authentication.id = password.id

			break

		default:
			throw new Error(`Unknown authentication type: ${authentication.type}`)
	}

	return authentication
}

// Strips sensitive data like exact email addresses and phone numbers
function public_pending_authentications(authentications)
{
	authentications = Object.clone(authentications)

	for (const authentication of authentications)
	{
		// `recepient` is used for access codes
		if (authentication.recepient)
		{
			delete authentication.recepient
		}

		// `locale` is used for access codes
		if (authentication.locale)
		{
			delete authentication.locale
		}
	}

	return authentications
}