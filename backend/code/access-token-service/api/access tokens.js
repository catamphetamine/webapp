import set_seconds from 'date-fns/set_seconds'
import { http, errors, jwt } from 'web-service'

import store from '../store/store'
import online_status_store from '../store/online store'

const latest_activity_time_refresh_interval = 60 * 1000 // one minute

export default function(api)
{
	// Returns a list of all tokens for this user
	api.get('/', async function({}, { user, access_token_id })
	{
		if (!user)
		{
			throw new errors.Unauthenticated()
		}

		const tokens = await store.get_tokens(user.id)

		// Mark the currently used token
		for (let token of tokens)
		{
			if (String(token.id) === access_token_id)
			{
				token.currently_used = true
			}
		}

		return tokens
	})

	// Checks if a token is valid
	api.get('/valid', async function({ bot }, { ip, access_token_id, user, internal_http })
	{
		// The user will be populated inside `common/web server`
		// out of the token data if the token is valid.
		// (only for `/valid` http get requests)
		//
		// If the user isn't populated from the token data
		// then it means that token data is corrupt.
		// (token data is encrypted and in this case decryption fails)
		//
		if (!user)
		{
			return { valid: false }
		}

		// Token data is valid.
		// The next step is to check that the token hasn't been revoked.

		// Try to get token validity status from cache
		const is_valid = await online_status_store.check_access_token_validity(user.id, access_token_id)

		// If such a key exists in Redis, then the token is valid.
		// Else, query the database for token validity
		if (!is_valid)
		{
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
			await online_status_store.set_access_token_validity(user.id, access_token_id, valid)

			if (!valid)
			{
				return { valid }
			}
		}

		// If it's not an automated Http request,
		// then update this authentication token's last access IP and time
		if (!bot)
		{
			record_access(user.id, access_token_id, ip, internal_http)
		}

		// The token is considered valid
		return { valid: true }
	})

	// Issues a new token
	api.post('/', async function({ user_id, payload, ip }, { keys })
	{
		// Create a database entry for the new token
		const token_id = await store.add_access_token(user_id, ip)

		// If there's too much tokens, then remove excessive ones.
		// (the newly created one being the most recently used one)
		await store.remove_excessive_tokens(user_id)

		// Generate JWT token
		return jwt({ payload, keys, user_id, jwt_id: token_id })
	})

	// Revokes a token
	api.post('/:id/revoke', async function({ id, poster_id, block_poster_token_id }, { user, access_token_id })
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
			id = access_token_id
		}

		await revoke_token(id, user.id)
	})

	api.get('/latest-recent-activity/:id', async function({ id })
	{
		return await online_status_store.get_latest_access_time(id)
	})
}

async function revoke_token(id, revoking_user_id)
{
	const token = await store.find_token_by_id(id)

	if (!token)
	{
		throw new errors.Not_found()
	}

	if (token.user !== revoking_user_id)
	{
		throw new errors.Unauthorized()
	}

	await store.revoke_token(id)
	await online_status_store.clear_access_token_validity(token.user, id)
}

async function record_access(user_id, access_token_id, ip, internal_http)
{
	try
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
	catch (error)
	{
		log.error(error)
		throw error
	}
}

// User's latest activity time accuracy
function round_user_access_time(time)
{
	return set_seconds(time, 0)
}