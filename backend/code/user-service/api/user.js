import { http, errors, jwt } from 'web-service'
import add_weeks from 'date-fns/add_weeks'
import is_before from 'date-fns/is_before'

import store from '../store'
import generate_alias from '../alias'

import
{
	get_user,
	get_user_self,
	public_user
}
from './user.base'

import can from '../../../../code/permissions'

import start_metrics from '../../../../code/metrics'

const metrics = start_metrics
({
	statsd:
	{
		...configuration.statsd,
		prefix : 'users'
	}
})

export default function(api)
{
	api.post('/register', async ({ name, email, locale }) =>
	{
		if (!exists(name))
		{
			throw new errors.Input_rejected(`"name" is required`)
		}

		if (!exists(email))
		{
			throw new errors.Input_rejected(`"email" is required`)
		}

		if (!exists(locale))
		{
			throw new errors.Input_rejected(`"locale" is required`)
		}

		if (await store.find_user_by_email(email))
		{
			throw new errors.Error(`User is already registered for this email`, { field: 'email' })
		}

		const is_the_first_user = await store.get_user_count() === 0

		const privileges =
		{
			role          : is_the_first_user ? 'administrator' : 'user', // 'moderator', 'senior moderator' (starting from moderator)
			// moderation    : [], // [1, 2, 3, ...] (starting from moderator)
			// switches      : [], // ['read_only', 'disable_user_registration', ...] (starting from senior moderator)
			// grant   : ['moderation', 'switches'] // !== true (starting from senior moderator)
			// revoke  : ['moderation', 'switches'] // !== true (starting from senior moderator)
		}

		const user =
		{
			name,
			email,
			locale,
			...privileges
		}

		// Try to derive a unique alias from email
		try
		{
			const alias = await generate_alias(email, alias => store.can_take_alias(alias))

			if (store.validate_alias(alias))
			{
				user.alias = alias
			}
		}
		catch (error)
		{
			log.error(`Couldn't generate alias for email ${email}`, error)
			// `alias` is not required
		}

		// Create user
		user.id = await store.create_user(user)

		// // Add authentication data (password) for this user
		// await http.post(`${address_book.authentication_service}/authentication-data`,
		// {
		// 	id,
		// 	password
		// })

		metrics.increment('count')

		return await authenticate_user(user, 'email')
	})

	// Revokes access token and clears authentication cookie
	api.post('/sign-out', async function({}, { user, authentication_token_id, destroy_cookie, internal_http })
	{
		// Must be logged in
		if (!user)
		{
			return new errors.Unauthenticated()
		}

		// Revoke access token
		await internal_http.post(`${address_book.access_token_service}/${authentication_token_id}/revoke`)

		// Clear authentcication cookie
		destroy_cookie('authentication')
	})

	api.post('/sign-in', async function({ email, phone })
	{
		let user
		let medium

		if (exists(email))
		{
			user = await store.find_user_by_email(email)
			medium = 'email'

			if (!user)
			{
				throw new errors.Not_found(`No user registered with this email`, { field: 'email' })
			}
		}
		else if (exists(phone))
		{
			// Currently not implemented
			user = await store.find_user_by_phone(phone)
			medium = 'phone'

			if (!user)
			{
				throw new errors.Not_found(`No user registered with this phone number`, { field: 'phone' })
			}
		}
		else
		{
			throw new errors.Input_rejected(`"email" or "phone" is required`)
		}

		// Check if the user is blocked
		if (user.blocked_at)
		{
			await user_is_blocked(user)
		}

		return authenticate_user(user, medium)
	})

	// Logs in the user if the multifactor authentication succeeded.
	api.post('/sign-in/authenticated', async function({ id }, { ip, keys, set_cookie })
	{
		const multifactor_authentication = await http.get
		(
			`${address_book.authentication_service}`,
			{ id, bot: true }
		)

		if (!multifactor_authentication)
		{
			// The authentication is still pending or does not exist.
			// (not returning an exact error message here
			//  to not make it easier for hackers)
			throw new errors.Access_denied()
		}

		if (multifactor_authentication.purpose !== 'sign in')
		{
			// The authentication is not for sign in.
			// (not returning an exact error message here
			//  to not make it easier for hackers)
			throw new errors.Access_denied()
		}

		// Get full user info
		const user = await store.find_user_by_id(multifactor_authentication.user)

		// Issue JWT token (the real one)
		const token = await http.post(`${address_book.access_token_service}`,
		{
			user_id : user.id,
			payload : configuration.authentication_token_payload.write(user),
			ip
		})

		// Write JWT token to a cookie
		set_cookie('authentication', token, { signed: false })
	})

	// Returns user's authentication configuration
	api.get('/authentication', async function({}, { user, internal_http })
	{
		if (!user)
		{
			throw new errors.Unauthenticated()
		}

		user = await get_user_self(user.id)

		const authentications = await internal_http.get(`${address_book.authentication_service}/info`)

		if (user.email)
		{
			authentications.push
			({
				type  : 'email',
				value : user.email
			})
		}
		else if (user.phone)
		{
			authentications.push
			({
				type  : 'phone',
				value : user.phone
			})
		}

		return authentications
	})

	// Get a list of all user's access tokens
	api.get('/access-tokens', async (parameters, { internal_http }) =>
	{
		return await internal_http.get(`${address_book.access_token_service}`, parameters)
	})

	// Revoke an access token
	api.post('/access-tokens/:id/revoke', async ({ id }, { internal_http }) =>
	{
		return await internal_http.post(`${address_book.access_token_service}/${id}/revoke`)
	})

	// Get user's "was online at" time
	api.get('/was-online-at/:id', async ({ id }) =>
	{
		// Try to fetch user's latest activity time from the current session
		// (is faster and more precise than from a database)
		const latest_recent_activity = await http.get(`${address_book.access_token_service}/latest-recent-activity/${id}`)

		if (latest_recent_activity)
		{
			return latest_recent_activity
		}

		// If there's no current session for the user,
		// then try to fetch user's latest activity time from the database

		const user = await store.find_user(id)

		if (!user)
		{
			throw new errors.Not_found(`User not found: ${id}`)
		}

		return user.was_online_at
	})

	// Update user's "was online at" time.
	// This is the internal method used by
	// `/authentication/valid` token validity check.
	// For manually updating user's online status just hit
	// any API endpoint without `bot` query parameter:
	// it will trigger token validity check which
	// automatically calls this internal endpoint.
	api.post('/was-online-at', async ({ date }, { user }) =>
	{
		if (!user)
		{
			throw new errors.Unauthenticated()
		}

		await store.update_user(user.id, { was_online_at: date })
	})

	// A dummy endpoint to update a user's online status
	api.post('/ping', () => {})

	// Get currently logged in user (if any)
	api.get('/', async function({}, { user })
	{
		// If no valid JWT token present,
		// then assume this user is not authenticated.
		if (!user)
		{
			return
		}

		return await get_user_self(user.id)
	})

	// Request a change for user's `email`
	api.patch('/email', async function({ email }, { user })
	{
		if (!user)
		{
			throw new errors.Unauthenticated()
		}

		if (!email)
		{
			throw new errors.Input_rejected('"email" is required', { field: 'email' })
		}

		// To get things like user's `email` and `locale`
		user = await store.find_user_by_id(user.id)

		return await http.post(`${address_book.authentication_service}/authenticate`,
		{
			user,
			using:
			[{
				type      : 'access code',
				medium    : 'email',
				recepient : user.email
			},
			{
				type      : 'access code',
				medium    : 'email',
				recepient : email
			}],
			purpose: 'change email'
		})
	})

	// Changes user's email if the multifactor authentication succeeded.
	api.patch('/email/authenticated', async function({ id }, { user })
	{
		const multifactor_authentication = await http.get
		(
			`${address_book.authentication_service}`,
			{ id, bot: true }
		)

		if (!multifactor_authentication)
		{
			// The authentication is still pending or does not exist.
			// (not returning an exact error message here
			//  to not make it easier for hackers)
			throw new errors.Access_denied()
		}

		if (multifactor_authentication.purpose !== 'change email')
		{
			// The authentication is not for email change.
			// (not returning an exact error message here
			//  to not make it easier for hackers)
			throw new errors.Access_denied()
		}

		if (multifactor_authentication.user !== user.id)
		{
			// The authentication is for another user.
			// (not returning an exact error message here
			//  to not make it easier for hackers)
			throw new errors.Access_denied()
		}

		// Update user's email
		await store.update_user(user.id, { email })

		// Generate a (self) block user token
		const block_user_token = await store.generate_block_user_token(user.id, { self: true })

		// Send a notification to the old mailbox
		http.post(`${address_book.mail_service}`,
		{
			to         : user.email,
			subject    : 'mail.email_changed.title',
			template   : 'email changed (old mailbox)',
			parameters :
			{
				email,
				block_account_link : `https://${configuration.website}/user/${user.id}/block/${block_user_token}`
			},
			locale     : user.locale
		})

		// Send a confirmation to the new mailbox
		http.post(`${address_book.mail_service}`,
		{
			to         : email,
			subject    : 'mail.email_changed.title',
			template   : 'email changed (new mailbox)',
			locale     : user.locale
		})
	})

	// Change user's `alias`
	api.patch('/alias', async function({ alias }, { user })
	{
		if (!user)
		{
			throw new errors.Unauthenticated()
		}

		if (!alias)
		{
			throw new errors.Input_rejected('"alias" is required', { field: 'alias' })
		}

		if (!store.validate_alias(alias))
		{
			throw new errors.Input_rejected('Invalid alias', { field: 'alias' })
		}

		if (!await store.can_take_alias(alias, user.id))
		{
			throw new errors.Conflict('Alias is already taken', { field: 'alias' })
		}

		await store.change_alias(user.id, alias)
	})

	// Change user data
	api.patch('/', async function(data, { user })
	{
		if (!user)
		{
			throw new errors.Unauthenticated()
		}

		if (!data.name)
		{
			throw new errors.Input_rejected(`"name" is required`)
		}

		await store.update_user(user.id,
		{
			name    : data.name,
			country : data.country,
			place   : data.place
		})

		return await get_user_self(user.id)
	})

	// Change user picture
	api.post('/picture', async function(picture, { user, authentication_token, internal_http })
	{
		if (!user)
		{
			throw new errors.Unauthenticated()
		}

		const user_data = await get_user_self(user.id)

		// Save the uploaded picture
		picture = await internal_http.post
		(
			`${address_book.image_service}/api/save`,
			{ type: 'user_picture', image: picture }
		)

		// Update the picture in `users` table
		await store.update_picture(user.id, picture)

		// Delete the previous user picture (if any)
		if (user_data.picture)
		{
			await internal_http.delete(`${address_book.image_service}/api/${user_data.picture}`)
		}

		return picture
	})

	// Change user's (or guest's) locale
	api.post('/locale', async function({ locale }, { set_cookie, user })
	{
		if (user)
		{
			await store.update_locale(user.id, locale)
		}
		else
		{
			set_cookie('locale', locale, { signed: false })
		}
	})

	// Obtains a block user token
	api.post('/:user_id/block-user-token', async ({ user_id }, { user }) =>
	{
		if (!user)
		{
			throw new errors.Unauthenticated()
		}

		// Can block self, also admins or moderators can block other users.
		if (!(user.id === user_id || can('block user', user)))
		{
			throw new errors.Unauthorized()
		}

		return await store.generate_block_user_token(user_id)
	})

	// Gets extended block user token info
	api.get('/:user_id/block-user-token/:token_id', async ({ user_id, token_id }, { user }) =>
	{
		const token = await store.get_block_user_token(token_id)

		if (!token || token.user !== user_id)
		{
			// Not being specific on the error message here
			// to not make it easier for hackers
			throw new errors.Not_found()
		}

		// Check if the token expired (is valid for a week)
		if (is_before(add_weeks(token.created_at, 1), new Date()))
		{
			throw new errors.Not_found(`Token expired`)
		}

		// Get extended user info (like name) for display on the page
		token.user = await get_user(token.user)

		return token
	})

	// Blocks a user
	api.post('/:user_id/block', async ({ user_id, token_id, reason }, { user }) =>
	{
		// Verify block user token

		const token = await store.get_block_user_token(token_id)

		if (!token || token.user !== user_id)
		{
			// Not being specific on the error message here
			// to not make it easier for hackers
			throw new errors.Not_found()
		}

		// Block the user
		await store.update_user(token.user,
		{
			blocked_at     : new Date(),
			blocked_by     : user ? user.id : token.user,
			blocked_reason : reason
		})

		// Revoke all user's tokens
		// (is performed after marking the user as blocked
		//  to prevent new access tokens being issued concurrently)
		await http.post
		(
			`${address_book.access_token_service}/*/revoke`,
			{ block_user_token_id : token.id }
		)

		// Consume this block user token
		await store.remove_block_user_token(token.id)
	})

	api.post('/unblock', async ({ id }, { user }) =>
	{
		if (!user)
		{
			throw new errors.Unauthorized()
		}

		// Only `moderator` or `administrator` can unblock users.
		// Also a poweruser can't unblock himself.
		if (!can('unblock user', user) || user.id === id)
		{
			throw new errors.Unauthorized()
		}

		log.info(`Unblocked user #${id} by moderator user #${user.id}`)

		await store.update_user(id,
		{
			blocked_at     : null,
			blocked_reason : null,
			blocked_by     : null
		})
	})

	// This pattern can potentially match other GET requests
	// it wasn't intended to match, so placing it in the end.
	api.get('/:id', async function({ id })
	{
		return await get_user(id)
	})
}

// Throws "User is blocked" error
async function user_is_blocked(user)
{
	const self_block = user.blocked_by === user.id

	throw new errors.Access_denied('User is blocked',
	{
		self_block,
		blocked_by     : !self_block && public_user(await store.find_user_by_id(user.blocked_by)),
		blocked_at     : user.blocked_at,
		blocked_reason : user.blocked_reason
	})
}

function authenticate_user(user, medium)
{
	return http.post(`${address_book.authentication_service}/authenticate`,
	{
		user,
		using:
		[{
			type: 'access code',
			medium
		}],
		purpose: 'sign in'
	})
}