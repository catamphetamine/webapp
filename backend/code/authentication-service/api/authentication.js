import moment from 'moment'
import { http, errors } from 'web-service'

import store               from '../store/store'
import online_status_store from '../store/online/online store'

import { sign_in, sign_out, get_user, check_password, hash_password } from './authentication.base'

const latest_activity_time_refresh_interval = 60 * 1000 // one minute

export default function(api)
{
	api.post('/sign-in', sign_in)

	api.post('/sign-out', sign_out)

	api.post('/register', async function({ id, password })
	{
		// hashing a password is a CPU-intensive lengthy operation.
		// takes about 60 milliseconds on my machine.
		//
		// maybe could be offloaded from node.js 
		// to some another multithreaded backend.
		//
		password = await hash_password(password)

		await store.create_authentication_data(id, { password })
	})

	api.get('/token/valid', async function({ bot }, { ip, authentication_token_id, user })
	{
		// The user will be populated inside `common/web server`
		// out of the token data if the token is valid.
		// (only for `/token/valid` http get requests)
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
		const is_valid = await online_status_store.check_access_token_validity(user.id, authentication_token_id)

		// If such a key exists in Redis, then the token is valid.
		// Else, query the database for token validity
		if (!is_valid)
		{
			const token = await store.find_token_by_id(authentication_token_id)

			const valid = token && !token.revoked_at

			// Cache access token validity
			await online_status_store.set_access_token_validity(user.id, authentication_token_id, valid)

			if (!valid)
			{
				return { valid }
			}
		}

		// If it's not an automated Http request,
		// then update this authentication token's last access IP and time
		if (!bot)
		{
			record_access(user.id, authentication_token_id, ip)
		}

		// The token is considered valid
		return { valid: true }
	})

	api.get('/password/check', async function({ password }, { user })
	{
		if (!user)
		{
			throw new errors.Unauthenticated()
		}

		// Check if the password matches
		const matches = await check_password(user.id, password)

		// If the password is wrong, return an error
		if (!matches)
		{
			throw new errors.Input_rejected(`Wrong password`, { field: 'password' }) 
		}
	})

	api.patch('/password', async function({ old_password, new_password }, { user })
	{
		if (!user)
		{
			throw new errors.Unauthenticated()
		}

		if (!old_password)
		{
			throw new errors.Input_rejected(`"old_password" is required`)
		}

		if (!new_password)
		{
			throw new errors.Input_rejected(`"new_password" is required`)
		}

		// Check if the old password matches
		const matches = await check_password(user.id, old_password)

		// If the old password is wrong, return an error
		if (!matches)
		{
			throw new errors.Input_rejected(`Wrong password`) 
		}

		// Hashing a password is a CPU-intensive lengthy operation.
		// takes about 60 milliseconds on my machine.
		//
		new_password = await hash_password(new_password)

		// Change password to the new one
		await store.update_password(user.id, new_password)
	})

	api.get('/latest-recent-activity/:id', async function({ id })
	{
		return await online_status_store.get_latest_access_time(id)
	})

	api.get('/tokens', async function({}, { user, authentication_token_id })
	{
		if (!user)
		{
			throw new errors.Unauthenticated()
		}

		const tokens = await store.get_tokens(user.id)

		// Mark the currently used token
		for (let token of tokens)
		{
			if (token.id === authentication_token_id)
			{
				token.currently_used = true
			}
		}

		return tokens
	})

	api.post('/token/revoke', async function({ id }, { user })
	{
		if (!user)
		{
			throw new errors.Unauthenticated()
		}

		const token = await store.find_token_by_id(id)

		if (!token)
		{
			return new errors.Not_found()
		}

		if (token.user !== user.id)
		{
			return new errors.Unauthorized()
		}

		await store.revoke_token(id)
		await online_status_store.clear_access_token_validity(user.id, id)
	})

	api.patch('/email', async function({ email }, { user })
	{
		if (!user)
		{
			throw new errors.Unauthenticated()
		}

		await store.update_email(user.id, email)
	})
}

async function record_access(user_id, authentication_token_id, ip)
{
	try
	{
		const now = Date.now()

		// Update latest access time: both for this (token, IP) pair and for the user
		await online_status_store.update_latest_access_time(user_id, authentication_token_id, ip, now)

		// When was the last time it was persisted to the database for this (token, IP) pair
		const persisted_at = await online_status_store.get_latest_access_time_persisted_at(authentication_token_id, ip)

		// If enough time has passed to update the persisted latest activity time
		// for this (token, IP) pair, then do it.
		if (!persisted_at || now - persisted_at >= latest_activity_time_refresh_interval)
		{
			// Update the time it was persisted to the database for this (token, IP) pair
			await online_status_store.set_latest_access_time_persisted_at(authentication_token_id, ip, now)

			// Fuzzy latest access time
			const was_online_at = round_user_access_time(now)

			// Update latest access time for this (token, IP) pair
			await store.record_access(user_id, authentication_token_id, ip, was_online_at)

			// Also update the redundant `was_online_at` field in the `users` table
			await http.patch(`${address_book.user_service}/was-online-at/${user_id}`, { date: was_online_at })
		}
	}
	catch (error)
	{
		log.error(error)
		throw error
	}
}

// user's latest activity time accuracy
function round_user_access_time(time)
{
	return new Date(moment(time).seconds(0).unix() * 1000)
}