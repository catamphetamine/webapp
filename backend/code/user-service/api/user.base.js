import { http, errors } from 'web-service'

import store from '../store/store'
import generate_alias from '../alias'

export async function sign_in({ email }, { set_cookie })
{
	if (!exists(email))
	{
		throw new errors.Input_rejected(`"email" is required`)
	}

	const user = await store.find_user_by_email(email)

	if (!user)
	{
		throw new errors.Not_found(`No user registered with this email`, { field: 'email' })
	}

	// Check if the user is blocked
	if (user.blocked_at)
	{
		await user_is_blocked(user)
	}

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

export async function sign_in_with_access_code({ id, code }, { set_cookie })
{
	// Get the user
	const access_code = await http.get(`${address_book.access_code_service}/${id}`)
	const user = await store.find_user(access_code.user)

	// Generate JWT authentication token
	const token = await http.post(`${address_book.authentication_service}/token`,
	{
		user:
		{
			// Send only the neccessary fields required for authentication
			id : user.id,

			// Send only the neccessary fields required for JWT payload
			role : user.role
		},

		access_code:
		{
			id,
			code
		}
	})

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

	const user_blocked_check = await store.find_user(user.id)

	if (user_blocked_check.blocked_at)
	{
		await http.post
		(
			`${address_book.authentication_service}/token/current/revoke`,
			{ bot: true },
			{ headers: { Authorization: `Bearer ${token}` } }
		)

		await user_is_blocked(user_blocked_check)
	}

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
	await internal_http.post(`${address_book.authentication_service}/token/${authentication_token_id}/revoke`)

	// Clear authentcication cookie
	destroy_cookie('authentication')
}

export async function register({ name, email, locale }, { internal_http })
{
	if (!exists(name))
	{
		throw new errors.Input_rejected(`"name" is required`)
	}

	if (!exists(email))
	{
		throw new errors.Input_rejected(`"email" is required`)
	}

	// if (!exists(password))
	// {
	// 	throw new errors.Input_rejected(`"password" is required`)
	// }

	if (!exists(locale))
	{
		throw new errors.Input_rejected(`"locale" is required`)
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
		locale,
		...privileges
	}

	// Try to derive a unique alias from email
	try
	{
		const alias = await generate_alias(email, alias => store.can_take_alias(alias))

		if (store.validate_alias(alias))
		{
			user.alias = alias
		}
	}
	catch (error)
	{
		log.error(`Couldn't generate alias for email ${email}`, error)
		// `alias` is not required
	}

	// Create user
	const id = await store.create_user(user)

	// // Add authentication data (password) for this user
	// await http.post(`${address_book.authentication_service}/authentication-data`,
	// {
	// 	id,
	// 	password
	// })

	return await internal_http.post(`${address_book.user_service}/sign-in`,
	{
		email
	})
}

// May possibly add something like { alias } in the future
export async function get_user({ id }, options = {})
{
	const user_data = await store.find_user(id)

	if (!user_data)
	{
		throw new errors.Not_found(`User not found: ${id}`)
	}

	if (user_data.blocked_by)
	{
		// This `if` prevents infinite recursion
		if (user_data.blocked_by === id)
		{
			user_data.blocked_by = public_user(user_data)
		}
		else
		{
			user_data.blocked_by = await get_user({ id: user_data.blocked_by })
		}
	}

	const { user } = options
	const self = user && id === String(user.id)
	return self ? own_user(user_data) : public_user(user_data)
}

function public_user(user)
{
	const fields =
	[
		'id',
		'name',
		'alias',
		'place',
		'country',
		'picture',
		'picture_sizes',
		'was_online_at',
		'blocked_at',
		'blocked_by',
		'blocked_reason'
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

async function user_is_blocked(user)
{
	const self_block = user.blocked_by === user.id

	throw new errors.Access_denied(`You are blocked`,
	{
		self_block,
		blocked_by     : !self_block && public_user(await store.find_user_by_id(user.blocked_by)),
		blocked_at     : user.blocked_at,
		blocked_reason : user.blocked_reason
	})
}