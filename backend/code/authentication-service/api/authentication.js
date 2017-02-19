import set_seconds from 'date-fns/set_seconds'
import { http, errors, jwt } from 'web-service'

import store                from '../store/store'
import online_status_store  from '../store/online/online store'
import authentication_store from '../store/authentication/store'
import Throttling from '../../common/throttling'

const latest_activity_time_refresh_interval = 60 * 1000 // one minute

const throttling = new Throttling(authentication_store)

export default function(api)
{
	api.post('/sign-in', async function(user)
	{
		// Check if the user is blocked
		if (user.blocked_at)
		{
			await user_is_blocked(user)
		}

		// Check if the user has two-factor authentication set up
		const authentication = await authentication_store.get_by_user(user.id)

		// If the user has two-factor authentication set up
		// then request password input.
		if (authentication)
		{
			if (authentication.type === 'password')
			{
				return password_authentication_response(authentication)
			}

			throw new Error(`Unknown authentication type: ${authentication.type}`)
		}

		// Generate access code
		return await access_code_authentication_response(user)
	})

	// Generates access code if the password matches
	api.post('/sign-in-proceed-with-password', async function({ id, password }, { ip, keys })
	{
		const authentication = await authentication_store.get(id)

		// Check if the password matches
		const { throttled, cooldown, result } = await throttling.attempt(authentication, async () =>
		{
			return await http.get(`${address_book.password_service}/matches`,
			{
				password,
				hashed_password : authentication.value
			})
		})

		if (throttled)
		{
			throw new errors.Access_denied('Password attempts limit exceeded', { cooldown })
		}

		// If the password is wrong, return an error
		if (!result)
		{
			throw new errors.Input_rejected(`Wrong password`, { field: 'password' })
		}

		// Get user's private info using the temporary token
		const user = await get_user_info(authentication.user, { ip, keys })

		// // Check if the user is blocked
		// if (user.blocked_at)
		// {
		// 	await user_is_blocked(user)
		// }

		// Generate access code
		return await access_code_authentication_response(user)
	})

	api.post('/sign-in-finish-with-access-code', async function({ id, code }, { ip, keys, set_cookie })
	{
		// Verify the access code
		const user_id = await http.get(`${address_book.access_code_service}/verify`, { id, code })

		if (!user_id)
		{
			throw new errors.Input_rejected('Wrong access code', { field: 'code' })
		}

		// Get user's private info using the temporary token
		const user = await get_user_info(user_id, { ip, keys })

		// Add a new JWT token to the list of valid tokens for this user
		const jwt_id = await store.add_authentication_token(user.id, ip)

		// Generate JWT token payload (the real one's)
		const payload = configuration.authentication_token_payload.write(user)

		// Issue JWT token (the real one)
		const token = jwt({ payload, keys, user_id: user.id, jwt_id })

		// If there was an almost impossible race condition
		// when the user was blocked while obtaining an access token,
		// then immediately revoke that token.
		//
		// (or, say, if an attacker managed to send an access code request
		//  directly to the `access-code-service` bypassing `user-service`)
		//
		// If we got here, then the token is already written to the database,
		// hence if the user is gonna be blocked right now
		// then this token will be rendered invalid.
		// So this second "just to make sure" check
		// prevents all possible user blocking race conditions.
		// (when a user is being blocked first its `blocked`
		// flag is set to `true` in the database
		// and then all his access tokens are rendered invalid)

		const user_blocked_check = await http.get
		(
			`${address_book.user_service}`,
			{ bot: true },
			{ headers: { 'Authorization': `Bearer ${token}` } }
		)

		if (user_blocked_check.blocked_at)
		{
			await revoke_token(jwt_id, user_id)
			await user_is_blocked(user_blocked_check)
		}

		// Write JWT token to a cookie
		set_cookie('authentication', token, { signed: false })

		return user
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
		await internal_http.post(`${address_book.authentication_service}/token/${authentication_token_id}/revoke`)

		// Clear authentcication cookie
		destroy_cookie('authentication')
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

	api.get('/token/valid', async function({ bot }, { ip, authentication_token_id, user, internal_http })
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

			// Cache access token validity.
			//
			// Theoretically there could be a small race condition here,
			// when a token validity is not cached, and that token is revoked
			// between the token validity being read from the database
			// and the token validition being cached, but I assume exploitability
			// of this race condition practically equal to zero.
			//
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
			record_access(user.id, authentication_token_id, ip, internal_http)
		}

		// The token is considered valid
		return { valid: true }
	})

	api.post('/token/:id/revoke', async function({ id, block_user_token_id }, { user, authentication_token_id })
	{
		// Special case for "revoke all tokens".
		// (e.g. when blocking a user)
		if (id === '*')
		{
			if (!block_user_token_id)
			{
				throw new errors.Input_rejected(`"block_user_token_id" is required`)
			}

			const block_user_token = await http.get(`${address_book.user_service}/block-user-token/${block_user_token_id}`)

			if (!block_user_token)
			{
				throw new errors.Not_found('Block user token not found')
			}

			for (let token of await store.get_all_valid_tokens(block_user_token.user.id))
			{
				await revoke_token(token.id, block_user_token.user.id)
			}

			return
		}

		if (!user)
		{
			throw new errors.Unauthenticated()
		}

		if (id === 'current')
		{
			id = authentication_token_id
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

async function record_access(user_id, authentication_token_id, ip, internal_http)
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

// Generates access code
async function generate_access_code(user)
{
	// Generate an access code
	const { id, code } = await http.post(`${address_book.access_code_service}`,
	{
		user   : user.id,
		locale : user.locale
	})

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

	// Return access code id
	return id
}

// Generates access code API response
const access_code_authentication_response = async (user) =>
({
	type : 'access code',
	id   : await generate_access_code(user)
})

// Generates password API response
const password_authentication_response = async (authentication) =>
({
	type : 'password',
	id   : authentication.id
})

async function get_user_info(user_id, { ip, keys })
{
	// Construct a temporary JWT token
	// just to get the user's private info

	// Add a new JWT token to the list of valid tokens for this user
	const temporary_token_id = await store.add_authentication_token(user_id, ip)

	// Generate temporary JWT token
	const temporary_token = jwt
	({
		payload: {},
		keys,
		user_id: user_id,
		jwt_id: temporary_token_id
	})

	// Get user's private info using the temporary token
	const user = await http.get
	(
		`${address_book.user_service}`,
		{ bot: true },
		{ headers: { 'Authorization': `Bearer ${temporary_token}` } }
	)

	// Revoke and delete the temporary token
	await revoke_token(temporary_token_id, user_id)
	await store.remove_token(temporary_token_id, user_id)

	return user
}