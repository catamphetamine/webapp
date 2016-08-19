import { http, errors, jwt } from 'web-service'

import { store, online_status_store } from '../store'

export async function sign_in({ email, password }, { ip, set_cookie, keys, internal_http })
{
	if (!exists(email))
	{
		throw new errors.Input_rejected(`"email" is required`)
	}

	if (!exists(password))
	{
		throw new errors.Input_rejected(`"password" is required`)
	}

	// Get user by email
	const user = await store.find_user_by_email(email)

	if (!user)
	{
		throw new errors.Not_found(`No user with this email`, { field: 'email' })
	}

	// If too many login attempts have been made
	// for this user recently, then impose a short cooldown period.
	if (await is_login_attempts_limit_exceeded(user))
	{
		throw new errors.Access_denied(`Login attempts limit exceeded`)
	}

	// Check if the password matches
	const matches = await check_password(password, user.password)

	// If the password is wrong, return an error
	if (!matches)
	{
		await login_attempt_failed(user)
		throw new errors.Input_rejected(`Wrong password`, { field: 'password' }) 
	}

	// Reset threshold for login attempt count limiter
	await login_attempt_succeeded(user)

	// sign in
	return await sign_in_as(user, { ip, set_cookie, keys, internal_http })
}

async function sign_in_as(user, { ip, set_cookie, keys, internal_http })
{
	// Add a new JWT token to the list of valid tokens for this user
	const jwt_id = await store.add_authentication_token(user, ip)

	// Use this temporary token just to obtain full user info,
	// which will be used for populating `payload` of the real JWT token.
	const temporary_token = jwt({ payload: {}, keys, user_id: user.id, jwt_id })

	// Get full user info (e.g. `role`)
	const user_data = await http.get(`${address_book.user_service}/${user.id}`, {},
	{
		headers: { Authorization: `Bearer ${temporary_token}` }
	})

	// If the user was not found (shouldn't normally happen)
	if (!user_data.id)
	{
		throw new errors.Not_found(`No user with this id`, { field: 'email' })
	}

	// Generate real JWT token payload
	const payload = configuration.authentication_token_payload.write(user_data)

	// Issue JWT token
	const token = jwt({ payload, keys, user_id: user.id, jwt_id })

	// Write JWT token to a cookie
	set_cookie('authentication', token, { signed: false })

	// Return full user info
	return own_user(user_data)
}

// Password bruteforce protection.
const The_hottest_allowed_temperature = 1000

// Each failed login attempt increases the `temperature` twice.
// Once the temperature reaches the maximum threshold
// all further login attempts will be denied.
// The temperature cools down to a half of its value every 15 minutes.
async function is_login_attempts_limit_exceeded(user)
{
	const Temperature_half_life = 15 * 60 // in seconds
	
	// If no login attempts failed so far
	// then allow the next login attempt.
	if (!user.latest_failed_login_attempt)
	{
		return
	}

	// Fast forward temperature cooldown 
	// since the latest failed login attempt till now.

	let temperature = user.latest_failed_login_attempt.temperature
	let when        = user.latest_failed_login_attempt.when.getTime()
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
	if (temperature !== user.latest_failed_login_attempt.temperature)
	{
		await store.set_login_temperature(user.id, temperature)
		user.latest_failed_login_attempt.temperature = temperature
	}

	// If the temperature is still too hot,
	// deny login attempts
	if (temperature > The_hottest_allowed_temperature)
	{
		return true
	}
}

async function login_attempt_succeeded(user)
{
	await store.clear_latest_failed_login_attempt(user.id)
}

async function login_attempt_failed(user)
{
	const Penalty_interval = 15 * 60 // in seconds

	let temperature

	if (user.latest_failed_login_attempt && user.latest_failed_login_attempt.temperature)
	{
		temperature = user.latest_failed_login_attempt.temperature

		// If the two consecutive failed login attempts weren't close enough to each other
		// then don't penalize and don't double the temperature.
		if (Date.now() > user.latest_failed_login_attempt.when.getTime() + Penalty_interval * 1000)
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
	await store.set_latest_failed_login_attempt(user.id, temperature)
}

export async function sign_out({}, { destroy_cookie, user, authentication_token_id })
{
	if (!user)
	{
		return
	}

	// console.log('*** user before sign out', user)

	await store.revoke_token(authentication_token_id, user.id)

	// console.log('*** user after sign out', user)

	destroy_cookie('authentication')
}

export async function register({ name, email, password, terms_of_service_accepted })
{
	if (!exists(name))
	{
		throw new errors.Input_rejected(`"name" is required`)
	}

	if (!exists(email))
	{
		throw new errors.Input_rejected(`"email" is required`)
	}

	if (!exists(password))
	{
		throw new errors.Input_rejected(`"password" is required`)
	}

	if (!terms_of_service_accepted)
	{
		throw new errors.Input_rejected(`You must accept the terms of service`)
	}

	if (await store.find_user_by_email(email))
	{
		throw new errors.Error(`User is already registered for this email`, { field: 'email' })
	}

	// hashing a password is a CPU-intensive lengthy operation.
	// takes about 60 milliseconds on my machine.
	//
	// maybe could be offloaded from node.js 
	// to some another multithreaded backend.
	//
	password = await hash_password(password)

	const user =
	{
		email,
		password
	}

	const id = await store.create_user(user)

	const privileges =
	{
		role          : 'administrator', // 'moderator', 'senior moderator' (starting from moderator)
		// moderation    : [], // [1, 2, 3, ...] (starting from moderator)
		// switches      : [], // ['read_only', 'disable_user_registration', ...] (starting from senior moderator)
		// grant   : ['moderation', 'switches'] // !== true (starting from senior moderator)
		// revoke  : ['moderation', 'switches'] // !== true (starting from senior moderator)
	}

	const user_data = 
	{
		id, 
		name,
		email,
		...privileges
	}

	await create_user(user_data)

	return { id }
}

export function own_user(user)
{
	const fields =
	[
		'id',
		'name',
		'picture',
		'role',
		// 'moderation',
		// 'switches',
		'locale'
	]

	const result = {}

	for (let key of fields)
	{
		result[key] = user[key]
	}

	return result
}

export async function check_password(password, hashed_password)
{
	return (await http.get(`${address_book.password_service}/check`, { password, hashed_password })).result
}

async function hash_password(password)
{
	return (await http.get(`${address_book.password_service}/hash`, { password })).hash
}

async function create_user(user)
{
	return (await http.post(address_book.user_service, user))
}