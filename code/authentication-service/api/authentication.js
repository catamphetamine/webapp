import { errors } from 'web-service'

import { store, online_status_store } from '../store'

import { sign_in, sign_out, register, get_user, own_user } from './authentication.base'

export default function(api)
{
	api.post('/sign-in', sign_in)

	api.post('/sign-out', sign_out)

	api.post('/register', register)

	api.post('/authenticate', async function({}, { user, http, get_cookie, set_cookie })
	{
		// If no valid JWT token present,
		// then assume this user is not authenticated.
		if (!user)
		{
			return
		}

		// Get extra user info from the database
		const user_info = await get_user(http, user.id)

		// If the user wasn't found in the databse
		// (shouldn't happen in normal circumstances)
		// then abort
		if (!user_info)
		{
			return
		}

		// Full user info
		// (info from JWT token payload
		//  merged with the info from the database)
		user = { ...user_info, ...user }

		// Return user info
		return own_user(user)
	})

	api.get('/validate-token', async function({ bot }, { ip, authentication_token_id, user })
	{
		// The user will be populated inside `common/web server`
		// out of the token data if the token is valid.
		// (only for `/validate-token` http get requests)
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

		const token = await store.find_token_by_id(authentication_token_id)

		if (!token || token.revoked)
		{
			return { valid: false }
		}

		// If it's not an automated Http request,
		// then update this authentication token's last access IP and time
		if (!bot)
		{
			store.record_access(user, authentication_token_id, ip)
		}

		// The token is considered valid
		return { valid: true }
	})

	api.post('/record-access', async function({}, { authentication_token_id, user, ip })
	{
		if (!user)
		{
			return
		}

		await store.record_access(user, authentication_token_id, ip)
	})

	api.get('/latest-activity/:id', async function({ id })
	{
		// try to fetch user's latest activity time from the current session
		// (is faster and more precise)

		const latest_activity_time = await online_status_store.get(id)

		if (latest_activity_time)
		{
			return { time: latest_activity_time }
		}

		// if there's no current session for the user, 
		// then try to fetch user's latest activity time from the database

		const user = await store.find_user_by_id(id)

		if (!user)
		{
			throw new errors.Not_found(`User not found`)
		}

		return { time: user.latest_activity_time }
	})

	api.get('/tokens', async function({}, { user })
	{
		return { tokens: await store.get_tokens(user.id) }
	})

	api.post('/revoke-token', async function({ id }, { user })
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

		if (token.user_id.toString() !== user.id)
		{
			return new errors.Unauthorized()
		}

		await store.revoke_token(id)
	})

	api.patch('/email', async function({ email }, { user })
	{
		if (!user)
		{
			throw new errors.Unauthenticated()
		}

		if (!(await store.update_email(user.id, email)))
		{
			throw new errors.Error(`Couldn't update user's email`)
		}
	})
}