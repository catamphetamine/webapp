import { http, errors } from 'web-service'

import store from '../store/store'
import { get_user, sign_in, sign_out, register, own_user } from './user.base'

export default function(api)
{
	api.post('/sign-in', sign_in)
	api.post('/sign-out', sign_out)
	api.post('/register', register)

	// Get user's "was online at" time
	api.get('/was-online-at/:id', async ({ id }) =>
	{
		// Try to fetch user's latest activity time from the current session
		// (is faster and more precise than from a database)
		const latest_recent_activity = await http.get(`${address_book.authentication_service}/latest-recent-activity/${id}`)

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

	// Update user's "was online at" time
	api.patch('/was-online-at/:id', async ({ id, date }) =>
	{
		await store.update_user(id, { was_online_at: date })
	})

	// Get currently logged in user (if any)
	api.get('/current', async function({}, { user, internal_http, get_cookie, set_cookie })
	{
		// If no valid JWT token present,
		// then assume this user is not authenticated.
		if (!user)
		{
			return
		}

		return await get_user({ id: user.id }, { user })
	})

	// Change user's `email`
	api.patch('/email', async function({ email, password }, { user, authentication_token, internal_http })
	{
		if (!user)
		{
			throw new errors.Unauthenticated()
		}

		if (!email)
		{
			throw new errors.Input_rejected('"email" is required', { field: 'email' })
		}

		if (!password)
		{
			throw new errors.Input_rejected('"password" is required', { field: 'password' })
		}

		await internal_http.get(`${address_book.authentication_service}/password/check`, { password })

		user = await store.find_user_by_id(user.id)

		await store.update_user(user.id, { email })

		const block_user_token = await store.generate_block_user_token(user.id, { self: true })

		internal_http.post(`${address_book.mail_service}`,
		{
			to         : user.email,
			subject    : 'mail.email_changed.title',
			template   : 'email changed (old mailbox)',
			parameters :
			{
				email,
				block_account_link : `https://${configuration.website}/user/block/${block_user_token}`
			},
			locale     : user.locale
		})

		internal_http.post(`${address_book.mail_service}`,
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

		return await get_user({ id: user.id }, { user })
	})

	// Change user picture
	api.post('/picture', async function(picture, { user, authentication_token, internal_http })
	{
		if (!user)
		{
			throw new errors.Unauthenticated()
		}

		const user_data = await get_user(user, { user })

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

	api.get('/block-user-token/:token_id', async ({ token_id }, { user }) =>
	{
		const token = await store.get_block_user_token(token_id)

		if (!token)
		{
			throw new errors.Not_found()
		}

		if (user)
		{
			if (!(user.id === token.user || ['moderator', 'administrator'].has(user.role)))
			{
				throw new errors.Unauthorized()
			}
		}

		if (token.user)
		{
			token.user = await get_user({ id: token.user })
		}

		return token
	})

	api.post('/block', async ({ token, reason }, { user }) =>
	{
		// Verify block user token

		const block_user_token = await store.get_block_user_token(token)

		if (!block_user_token)
		{
			throw new errors.Not_found()
		}

		// Block the user
		await store.update_user(block_user_token.user,
		{
			blocked_at     : new Date(),
			blocked_by     : user ? user.id : block_user_token.user,
			blocked_reason : reason
		})

		// Revoke all user's tokens
		await http.post
		(
			`${address_book.authentication_service}/token/*/revoke`,
			{ block_user_token_id : block_user_token.id }
		)

		// Consume block user token
		await store.remove_block_user_token(token)
	})

	api.post('/unblock', async ({ id }, { user }) =>
	{
		if (!user)
		{
			throw new errors.Unauthorized()
		}

		// Only `moderator` or `administrator` can unblock users.
		// Also a poweruser can't unblock himself.
		if (!['moderator', 'administrator'].has(user.role)
			|| user.id === id)
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
	api.get('/:id', async function({ id }, { user })
	{
		return await get_user({ id }, { user })
	})
}