import { http, errors, jwt } from 'web-service'

import store from '../store/store'

export async function sign_in(user, { ip, set_cookie, keys, internal_http })
{
	// Get authentication data by user's `id`
	const authentication_data = await store.get_authentication_data(user.id)

	// If too many login attempts have been made
	// for this user recently, then impose a short cooldown period.
	if (await is_login_attempts_limit_exceeded(authentication_data))
	{
		throw new errors.Access_denied(`Login attempts limit exceeded`)
	}

	if (!exists(user.password))
	{
		throw new errors.Input_rejected(`"password" is required`)
	}

	// Check if the password matches
	const matches = await check_password(user.password, authentication_data.password)

	// If the password is wrong, return an error
	if (!matches)
	{
		await login_attempt_failed(authentication_data)
		throw new errors.Input_rejected(`Wrong password`, { field: 'password' }) 
	}

	// Reset threshold for login attempt count limiter
	await login_attempt_succeeded(authentication_data)

	// sign in
	return await sign_in_as(user, { ip, set_cookie, keys, internal_http })
}

async function sign_in_as(user, { ip, set_cookie, keys, internal_http })
{
	// Add a new JWT token to the list of valid tokens for this user
	const jwt_id = await store.add_authentication_token(user.id, ip)

	// Use this temporary token just to obtain full user info,
	// which will be used for populating `payload` of the real JWT token.
	const temporary_token = jwt({ payload: {}, keys, user_id: user.id, jwt_id })

	// Generate real JWT token payload
	const payload = configuration.authentication_token_payload.write(user)

	// Issue JWT token
	return jwt({ payload, keys, user_id: user.id, jwt_id })
}

// Password bruteforce protection.
const The_hottest_allowed_temperature = 1000

// Each failed login attempt increases the `temperature` twice.
// Once the temperature reaches the maximum threshold
// all further login attempts will be denied.
// The temperature cools down to a half of its value every 15 minutes.
async function is_login_attempts_limit_exceeded(authentication_data)
{
	const Temperature_half_life = 15 * 60 // in seconds
	
	// If no login attempts failed so far
	// then allow the next login attempt.
	if (!authentication_data.login_attempt_failed_at)
	{
		return
	}

	// Fast forward temperature cooldown 
	// since the latest failed login attempt till now.

	let temperature = authentication_data.login_attempt_temperature
	let when        = authentication_data.login_attempt_failed_at.getTime()
	const now       = Date.now()
	
	while (now >= when + Temperature_half_life * 1000)
	{
		// Cool down the temperature to a half of its value
		temperature /= 2
		when += Temperature_half_life * 1000

		// Consider all temperatures below 1 to equal 0
		// because it doesn't really matter and saves CPU cycles
		if (temperature < 1)
		{
			temperature = 0
			break
		}
	}

	// Update the temperature in the database
	if (temperature !== authentication_data.login_attempt_temperature)
	{
		await store.set_login_temperature(authentication_data.id, temperature)
	}

	// If the temperature is still too hot,
	// deny login attempts
	if (temperature > The_hottest_allowed_temperature)
	{
		return true
	}
}

async function login_attempt_succeeded(authentication_data)
{
	await store.clear_latest_failed_login_attempt(authentication_data.id)
}

async function login_attempt_failed(authentication_data)
{
	const Penalty_interval = 15 * 60 // in seconds

	let temperature = authentication_data.login_attempt_temperature

	if (temperature)
	{
		const when = authentication_data.login_attempt_failed_at.getTime()

		// If the two consecutive failed login attempts weren't close enough to each other
		// then don't penalize and don't double the temperature.
		if (Date.now() > when + Penalty_interval * 1000)
		{
			// no penalty
		}
		// Otherwise add penalty
		else
		{
			// Double the temperature
			temperature *= 2
		}
	}
	else
	{
		// The initial temperature is 2
		// for a sequence of failed login attempts
		temperature = 2
	}

	// Register this failed login attempt
	await store.set_latest_failed_login_attempt(authentication_data.id, temperature)
}

export async function sign_out({}, { destroy_cookie, user, authentication_token_id })
{
	// Shouldn't happen
	if (!user)
	{
		return
	}

	await store.revoke_token(authentication_token_id, user.id)

	destroy_cookie('authentication')
}

export async function check_password(password, hashed_password)
{
	return await http.get(`${address_book.password_service}/check`, { password, hashed_password })
}

export async function hash_password(password)
{
	return (await http.get(`${address_book.password_service}/hash`, { password })).hash
}

async function create_user(user)
{
	return await http.post(address_book.user_service, user)
}