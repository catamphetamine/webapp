import { errors } from 'web-service'

import store               from '../store/store'
import online_status_store from '../store/online/online store'

import { sign_in, sign_out, register, get_user, own_user, check_password, hash_password } from './authentication.base'

export default function(api)
{
	api.post('/sign-in', sign_in)

	api.post('/sign-out', sign_out)

	api.post('/register', register)

	api.post('/authenticate', async function({}, { user, internal_http, get_cookie, set_cookie })
	{
		// If no valid JWT token present,
		// then assume this user is not authenticated.
		if (!user)
		{
			return
		}

		// Get user info from the database
		user = await internal_http.get(`${address_book.user_service}/${user.id}`)

		// If the user wasn't found in the databse
		// (shouldn't happen in normal circumstances)
		// then abort
		if (!user)
		{
			return
		}

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

	api.get('/password/check', async function({ password }, { user })
	{
		if (!user)
		{
			throw new errors.Unauthenticated()
		}

		if (!password)
		{
			throw new errors.Input_rejected(`"password" is required`)
		}

		// Get user by email
		user = await store.find_user_by_id(user.id)

		// Shouldn't happen, but just in case
		if (!user)
		{
			throw new errors.Not_found()
		}

		// Check if the password matches
		const matches = await check_password(password, user.password)

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

		// Get user by email
		user = await store.find_user_by_id(user.id)

		// Shouldn't happen, but just in case
		if (!user)
		{
			throw new errors.Not_found()
		}

		// Check if the old password matches
		const matches = await check_password(old_password, user.password)

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
			throw new errors.Not_found(`User not found: ${id}`)
		}

		return { time: user.latest_activity_time }
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

		return { tokens }
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

		await store.update_email(user.id, email)
	})
}