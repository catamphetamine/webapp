import { http, errors } from 'web-service'

import store from '../store/store'

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

	// Generate JWT authentication token
	const token = await http.post(`${address_book.authentication_service}/sign-in`,
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

	const id = await store.create_user(user)

	await http.post(`${address_book.authentication_service}/register`, { id, password })

	return { id }
}

export async function get_user({ id }, { user })
{
	const user_data = await store.find_user_by_id(id)

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