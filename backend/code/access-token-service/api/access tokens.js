import set_seconds from 'date-fns/set_seconds'
import { http, errors, jwt } from 'web-service'

import store from '../store/store'
import online_status_store from '../store/online store'

const latest_activity_time_refresh_interval = 60 * 1000 // one minute

export default function(api)
{
	// Returns a list of all tokens for this user
	api.get('/', async function({}, { user })
	{
		if (!user)
		{
			throw new errors.Unauthenticated()
		}

		const tokens = await store.get_tokens(user.id)

		// Mark the currently used token
		for (let token of tokens)
		{
			if (String(token.id) === user.access_token_id)
			{
				token.currently_used = true
			}
		}

		return tokens
	})

	// Checks if an access (refresh) token is still valid
	api.get('/:id/valid', async ({ id }) =>
	{
		// Check that the refresh token hasn't been revoked.
		const is_valid = await is_token_valid(id)
	})

	// Refreshes an access token.
	// Returns nothing if was unable to refresh an access token.
	// Returns a new access token otherwise.
	api.post('/refresh', async function({}, { ip, access_token_payload, access_token_id, user, keys, internal_http })
	{
		// The user will be populated from the refresh token.
		// If the user isn't populated
		// then it means that refresh token is invalid.
		if (!user)
		{
			throw new errors.Unauthorized('Invalid refresh token')
		}

		// Check that the token has a "refresh" scope
		if (!access_token_payload.scopes || !access_token_payload.scopes.has('refresh'))
		{
			throw new errors.Unauthorized('This token has no refresh privileges')
		}

		// Refresh token has been verified.
		// The next step is to check that the refresh token hasn't been revoked.
		const is_valid = await is_token_valid(access_token_id)

		// The refresh token hasn't been revoked.

		// Generate a temporary access token (to get user's roles).
		const temporary_token = jwt
		({
			payload   : {},
			key       : keys[0],
			userId    : user.id,
			expiresIn : configuration.access_token_lifespan
		})

		// Get full user data (for the new access token payload)
		user = await http.get
		(
			address_book.user_service,
			{ bot: true },
			{ headers: { Authorization: `Bearer ${temporary_token}` } }
		)

		// Generate a new access token (with user's roles).
		return jwt
		({
			payload   : configuration.access_token_payload.write(user, access_token_id),
			key       : keys[0],
			userId    : user.id,
			expiresIn : configuration.access_token_lifespan
		})
	})

	// Issues a new token
	api.post('/', async function({ user_id, payload, ip, expires_in }, { keys })
	{
		let token_id

		// If it's a refresh token then track it
		if (expires_in === undefined)
		{
			// Create a database entry for the new token
			token_id = await store.add_access_token(user_id, ip)

			// If there's too much tokens, then remove excessive ones.
			// (the newly created one being the most recently used one)
			await store.remove_excessive_tokens(user_id)
		}

		// Generate JWT token (refresh token)
		const result =
		{
			token : jwt({ payload, key: keys[0], userId: user_id, tokenId: token_id, expiresIn: expires_in }),
			id    : token_id
		}

		return result
	})

	// Revokes a token
	api.post('/:id/revoke', async function({ id, poster_id, block_poster_token_id }, { user })
	{
		// Special case for "revoke all tokens".
		// (e.g. when blocking a user)
		if (id === '*')
		{
			if (!block_poster_token_id)
			{
				throw new errors.Input_rejected(`"block_poster_token_id" is required`)
			}

			// Makes sure the block token is valid
			await http.get(`${address_book.social_service}/poster/${poster_id}/block-poster-token/${block_poster_token_id}`)

			// Get the user being blocked
			const poster = await http.get(`${address_book.social_service}/poster/${poster_id}`)

			// Revoke all tokens of this user
			for (const token of await store.get_all_valid_tokens(poster.user))
			{
				await revoke_token(token.id, poster.user)
			}

			return
		}

		if (!user)
		{
			throw new errors.Unauthenticated()
		}

		if (id === 'current')
		{
			id = user.access_token_id
		}

		await revoke_token(id, user.id)
	})

	api.get('/latest-recent-activity/:id', async function({ id })
	{
		return await online_status_store.get_latest_access_time(id)
	})

	// Records user access
	api.post('/record-access', async ({}, { user, ip, internal_http }) =>
	{
		await record_access(user.id, user.access_token_id, ip, internal_http)
	})
}

async function revoke_token(id, revoking_user_id)
{
	const token = await store.find_token_by_id(id)

	if (!token)
	{
		throw new errors.Not_found()
	}

	if (String(token.user) !== String(revoking_user_id))
	{
		throw new errors.Unauthorized()
	}

	await store.revoke_token(id)
	await online_status_store.clear_access_token_validity(token.user, id)
}

async function record_access(user_id, access_token_id, ip, internal_http)
{
	const now = Date.now()

	// Update latest access time: both for this (token, IP) pair and for the user
	await online_status_store.update_latest_access_time(user_id, access_token_id, ip, now)

	// When was the last time it was persisted to the database for this (token, IP) pair
	const persisted_at = await online_status_store.get_latest_access_time_persisted_at(access_token_id, ip)

	// If enough time has passed to update the persisted latest activity time
	// for this (token, IP) pair, then do it.
	if (!persisted_at || now - persisted_at >= latest_activity_time_refresh_interval)
	{
		// Update the time it was persisted to the database for this (token, IP) pair
		await online_status_store.set_latest_access_time_persisted_at(access_token_id, ip, now)

		// Fuzzy latest access time
		const was_online_at = round_user_access_time(now)

		// Update latest access time for this (token, IP) pair
		await store.record_access(user_id, access_token_id, ip, was_online_at)

		// Also update the redundant `was_online_at` field in the `users` table
		await internal_http.post(`${address_book.user_service}/was-online-at`, { date: was_online_at })
	}
}

// Checks if a token hasn't been revoked.
async function is_token_valid(access_token_id)
{
	// Try to get token validity status from cache
	const is_valid = await online_status_store.check_access_token_validity(access_token_id)

	// If such a key exists in Redis, then the token is valid.
	// Else, query the database for token validity
	if (is_valid)
	{
		return true
	}

	const token = await store.find_token_by_id(access_token_id)

	const valid = token && !token.revoked_at

	// Cache access token validity.
	//
	// Theoretically there could be a small race condition here,
	// when a token validity is not cached, and that token is revoked
	// between the token validity being read from the database
	// and the token validition being cached, but I assume exploitability
	// of this race condition practically equal to zero.
	//
	await online_status_store.set_access_token_validity(access_token_id, valid)

	return valid
}

// User's latest activity time accuracy
function round_user_access_time(time)
{
	return set_seconds(time, 0)
}