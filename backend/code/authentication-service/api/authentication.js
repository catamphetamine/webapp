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
	// Returns multifactor authentication info,
	// deleting it from the database if it succeeded.
	// If it has not, returns `undefined`.
	api.get('/', async function({ id })
	{
		const multifactor_authentication = await store.get_multifactor_authentication({ uuid: id })

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
		if (Date.now() >= multifactor_authentication.expires.getTime())
		{
			return
		}

		return multifactor_authentication
	})

	// Performs an authentication step of a multifactor authentication
	api.post('/', async function({ multifactor_authentication_id, id, value })
	{
		const multifactor_authentication = await store.get_multifactor_authentication({ uuid: multifactor_authentication_id })

		const authentication = await store.get(id)

		if (!multifactor_authentication || !authentication)
		{
			throw new errors.Not_found()
		}

		// If it's a password then hash it
		if (authentication.type === 'password')
		{
			value = await hash_password(value)
		}

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
			if (authentication.value !== value)
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
			const pending = await store.update_multifactor_authentication_being_authenticated(multifactor_authentication_id, id)
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

		return result
	})

	// Authenticates a user with things like a password and an access code
	api.post('/authenticate', async function(input, { user })
	{
		const { using, purpose } = input

		// If the user is using authentication to sign in
		// then get user's private info from the supplied input.
		if (!user)
		{
			user = input.user
		}

		// Check unfinished multifactor authentications for this user
		let multifactor_authentication = await store.get_user_multifactor_authentication(user.id, 'sign in')

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
			// with a given `purpose` (for simplicity).
			await store.delete_multifactor_authentication(multifactor_authentication.id)
		}

		// Collect authentications for the new multifactor authentication
		const authentications = []

		// Check if the user has a password set up
		const password = await store.get_user_authentication(user.id, 'password')

		// If the user has a password set up
		// then request the password.
		if (password)
		{
			authentications.push
			({
				type : 'password',
				id   : password.id
			})
		}

		// Generate access code
		authentications.push
		({
			type : 'access code',
			id   : await generate_access_code(user, using)
		})

		// Report stats
		metrics.increment('count')

		// Create multifactor authentication
		const id = uuid.v4()
		await store.create_multifactor_authentication(id, user.id, 'sign in', authentications, multifactor_authentication)

		// Return multifactor authentication info
		const result =
		{
			id,
			pending: authentications
		}

		return result
	})
}

// Generates access code
// (must only be called from throttled handlers)
async function generate_access_code(user, using)
{
	// Generate an access code

	const code = get_word(user.locale)

	const data =
	{
		user    : user.id,
		type    : 'access code',
		value   : code,
		expires : new Date(Date.now() + access_code_lifetime),
		attempts_left : access_code_max_attempts
	}

	const id = await store.create(data)

	// Determine access code delivery type (if not specified)
	if (!using)
	{
		if (user.email)
		{
			using = 'email'
		}
		else if (user.phone)
		{
			using = 'phone'
		}
	}

	// Deliver the access code to the user
	switch (using)
	{
		case 'email':
			// Send the access code via email
			await http.post(`${address_book.mail_service}`,
			{
				to         : user.email,
				template   : 'sign in code',
				locale     : user.locale,
				parameters :
				{
					code
				}
			})
			break

		case 'phone':
			throw new Error('Sending access codes via SMS is not currently implemented')
			// await http.post(`${address_book.message_delivery_service}`,
			// {
			// 	medium     : 'phone',
			// 	to         : user.phone,
			// 	template   : 'sign in code',
			// 	locale     : user.locale,
			// 	parameters :
			// 	{
			// 		code
			// 	}
			// })
			break

		default:
			throw new Error(`Unknown access code delivery type: ${using}`)
	}

	// Return access code id
	return id
}

// Hashes a password
async function hash_password(password)
{
	return (await http.get(`${address_book.password_service}/hash`, { password })).hash
}