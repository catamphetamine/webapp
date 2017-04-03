import { http, errors } from 'web-service'
import add_weeks from 'date-fns/add_weeks'
import is_before from 'date-fns/is_before'

import store from '../store'
import generate_alias from '../alias'

export default function(api)
{
	// Create a poster
	api.post('/poster', async ({ email }) =>
	{
		const poster = {}

		// Try to derive a unique alias from email
		try
		{
			const alias = await generate_alias(email, alias => store.can_take_alias(alias))

			if (store.validate_alias(alias))
			{
				poster.alias = alias
			}
		}
		catch (error)
		{
			log.error(`Couldn't generate alias for email ${email}`, error)
			// `alias` is not required
		}
	})

	// Change poster's `alias`
	api.post('/poster/:id/alias', async function({ id, alias }, { user })
	{
		if (!user)
		{
			throw new errors.Unauthenticated()
		}

		const poster = await store.get_poster(id)

		// If this user is not the user of the poster
		// and is not in the `users` of the `poster`
		// then editing the poster is not permitted.
		if (!can_edit_poster(user, poster))
		{
			throw new errors.Unauthorized()
		}

		if (!alias)
		{
			throw new errors.Input_rejected('"alias" is required', { field: 'alias' })
		}

		if (!store.validate_alias(alias))
		{
			throw new errors.Input_rejected('Invalid alias', { field: 'alias' })
		}

		if (!await store.can_take_alias(alias, id))
		{
			throw new errors.Conflict('Alias is already taken', { field: 'alias' })
		}

		await store.change_alias(id, alias)
	})

	// Change poster data
	api.patch('/poster/:id', async function({ id, name, country, place, palette }, { user })
	{
		if (!user)
		{
			throw new errors.Unauthenticated()
		}

		const poster = await store.get_poster(id)

		// If this user is not the user of the poster
		// and is not in the `users` of the `poster`
		// then editing the poster is not permitted.
		if (!can_edit_poster(user, poster))
		{
			throw new errors.Unauthorized()
		}

		if (!name)
		{
			throw new errors.Input_rejected(`"name" is required`)
		}

		await store.update_poster(id,
		{
			name,
			country,
			place,
			palette
		})

		return await get_poster(id)
	})

	// Change poster picture
	api.post('/poster/:id/picture', async function({ id, picture }, { user, internal_http })
	{
		return await update_picture(id, picture, 'poster_picture', 'picture', user, internal_http)
	})

	// Change poster background pattern
	api.post('/poster/:id/background', async function({ id, picture }, { user, internal_http })
	{
		return await update_picture(id, picture, 'poster_background_pattern', 'background_pattern', user, internal_http)
	})

	// Change poster banner
	api.post('/poster/:id/banner', async function({ id, picture }, { user, internal_http })
	{
		return await update_picture(id, picture, 'poster_banner', 'banner', user, internal_http)
	})

	// Obtains a block poster token
	api.post('/poster/:id/block-poster-token', async ({ id }, { user }) =>
	{
		if (!user)
		{
			throw new errors.Unauthenticated()
		}

		const poster = await store.get_poster(id)

		// Can block self, can block a poster being an administrator of one,
		// also admins or moderators can block other posters (and users).
		if (!(can_edit_poster(user, poster) || can('block poster', user)))
		{
			throw new errors.Unauthorized()
		}

		return await store.generate_block_poster_token(id, { self: poster.user === user.id })
	})

	// Gets extended block poster token info
	// (is called from access token service)
	api.get('/poster/:poster_id/block-poster-token/:token_id', async ({ poster_id, token_id }, { user }) =>
	{
		const token = await store.get_block_poster_token(token_id)

		if (!token || token.poster !== poster_id)
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

		// Get extended poster info (like name) for display on the page
		token.poster = await store.get_poster(token.poster)

		return token
	})

	// Blocks a poster
	api.post('/poster/:poster_id/block', async ({ poster_id, token_id, reason }, { user, internal_http }) =>
	{
		// Verify block poster token

		const token = await store.get_block_poster_token(token_id)

		if (!token || token.poster !== poster_id)
		{
			// Not being specific on the error message here
			// to not make it easier for hackers
			throw new errors.Not_found()
		}

		const poster = await store.get_poster(poster_id)

		// Block the poster
		await store.update_poster(poster_id,
		{
			blocked_at     : new Date(),
			blocked_by     : user ? user.id : poster.user,
			blocked_reason : reason
		})

		// Block the user (if it's a poster of a user)
		if (poster.user)
		{
			// Block the user
			await internal_http.post(`${address_book.user_service}/${poster.user}/block`,
			{
				token_id,
				poster_id,
				reason
			})

			// Revoke all user's tokens
			// (is performed after marking the user as blocked
			//  to prevent new access tokens being issued concurrently)
			await http.post
			(
				`${address_book.access_token_service}/*/revoke`,
				{
					block_poster_token_id : token_id,
					poster_id
				}
			)
		}

		// Consume this block poster token
		await store.delete_block_poster_token(token_id)
	})

	// Unblocks a poster
	api.post('/poster/unblock', async ({ id }, { user, internal_http }) =>
	{
		if (!user)
		{
			throw new errors.Unauthorized()
		}

		// Only `moderator` or `administrator` can unblock users.
		// Also a poweruser can't unblock himself
		// (e.g. in case he was blocked for misbehaving).
		if (!can('unblock user', user) || user.id === id)
		{
			throw new errors.Unauthorized()
		}

		log.info(`Unblocked poster #${id} by moderator user #${user.id}`)

		const poster = await store.get_poster(id)

		// Unblock the poster
		await store.update_poster(id,
		{
			blocked_at     : null,
			blocked_reason : null,
			blocked_by     : null
		})

		// Unblock the user (if it's a poster of a user)
		if (poster.user)
		{
			// Unblock the user
			await internal_http.post(`${address_book.user_service}/${poster.user}/unblock`)
		}
	})

	// Get poster by user id
	api.get('/poster/user/:id', async function({ id })
	{
		return await store.get_user_poster(id)
	})

	// This pattern can potentially match other GET requests
	// it wasn't intended to match, so placing it in the end.
	api.get('/poster/:id', async function({ id })
	{
		return await get_poster(id)
	})
}

function can_edit_poster(user, poster)
{
	return poster.user === user.id || poster.users.filter(user => user.id === user.id).not_empty()
}

async function get_poster(id)
{
	const poster = await store.find_poster(id)

	if (!poster)
	{
		throw new errors.Not_found(`Poster "${id}" not found`)
	}

	if (poster.blocked_by)
	{
		// poster.blocked_by = await http.get(`${address_book.user_service}/${poster.blocked_by}`)

		poster.blocked_by =
		{
			poster: await store.find_user_poster(poster.blocked_by)
		}
	}

	return poster
}

async function update_picture(id, picture, type, property, user, internal_http)
{
	if (!user)
	{
		throw new errors.Unauthenticated()
	}

	const poster = await store.get_poster(id)

	// If this user is not the user of the poster
	// and is not in the `users` of the `poster`
	// then editing the poster is not permitted.
	if (!can_edit_poster(user, poster))
	{
		throw new errors.Unauthorized()
	}

	// Save the uploaded picture
	picture = await internal_http.post
	(
		`${address_book.image_service}/api/save`,
		{
			type,
			image: picture
		}
	)

	// Update the picture in `posters` table
	await store.update_poster(id,
	{
		[property] : picture
	})

	// Delete the previous picture (if any)
	if (poster[property])
	{
		await internal_http.delete(`${address_book.image_service}/api/${poster[property].id}`)
	}

	return picture
}