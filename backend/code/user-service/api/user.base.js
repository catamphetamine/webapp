import { http, errors } from 'web-service'

import store from '../store/store'
import generate_username from '../username'

export async function sign_in({ email, password }, { set_cookie })
{
	if (!exists(email))
	{
		throw new errors.Input_rejected(`"email" is required`)
	}

	if (!exists(password))
	{
		throw new errors.Input_rejected(`"password" is required`)
	}

	const user = await store.find_user_by_email(email)

	if (!user)
	{
		throw new errors.Not_found(`No user registered with this email`, { field: 'email' })
	}

	if (user.blocked_at)
	{
		throw new errors.Access_denied(`You are blocked`)
	}

	// Generate JWT authentication token
	const token = await http.post(`${address_book.authentication_service}/token`,
	{
		// Send only the neccessary fields required for authentication
		id : user.id,
		password,

		// Send only the neccessary fields required for JWT payload
		role : user.role
	})

	// Write JWT token to a cookie
	set_cookie('authentication', token, { signed: false })

	return own_user(user)
}

// Revokes access token and clears authentication cookie
export async function sign_out({}, { user, authentication_token_id, destroy_cookie, internal_http })
{
	// Must be logged in
	if (!user)
	{
		return new errors.Unauthenticated()
	}

	// Revoke access token
	await internal_http.post(`${address_book.authentication_service}/token/revoke`,
	{
		id : authentication_token_id
	})

	// Clear authentcication cookie
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

	const privileges =
	{
		role          : 'administrator', // 'moderator', 'senior moderator' (starting from moderator)
		// moderation    : [], // [1, 2, 3, ...] (starting from moderator)
		// switches      : [], // ['read_only', 'disable_user_registration', ...] (starting from senior moderator)
		// grant   : ['moderation', 'switches'] // !== true (starting from senior moderator)
		// revoke  : ['moderation', 'switches'] // !== true (starting from senior moderator)
	}

	const user =
	{
		name,
		email,
		...privileges
	}

	// Try to derive a unique username from email
	try
	{
		const username = await generate_username(email, store.is_unique_username.bind(store))

		if (store.validate_username(username))
		{
			user.username = username
		}
	}
	catch (error)
	{
		log.error(`Couldn't generate username for email ${email}`, error)
		// `username` is not required
	}

	// Create user
	const id = await store.create_user(user)

	// Add authentication data (password) for this user
	await http.post(`${address_book.authentication_service}/authentication-data`,
	{
		id,
		password
	})

	return { id }
}

export async function get_user({ id }, { user })
{
	const user_data = await store.find_user(id)

	if (!user_data)
	{
		throw new errors.Not_found(`User not found: ${id}`)
	}

	return (user && id === String(user.id)) ? own_user(user_data) : public_user(user_data)
}

function public_user(user)
{
	const fields =
	[
		'id',
		'name',
		'username',
		'place',
		'country',
		'picture',
		'picture_sizes',
		'was_online_at'
	]

	const result = {}

	for (let key of fields)
	{
		result[key] = user[key]
	}

	return result
}

export function own_user(user)
{
	const result =
	{
		...public_user(user),

		email      : user.email,

		role       : user.role,
		// moderation : user.moderation,
		// switches   : user.switches,

		locale : user.locale
	}

	return result
}