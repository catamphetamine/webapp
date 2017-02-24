import { http, errors } from 'web-service'

import store from '../store/store'
import generate_alias from '../alias'

import start_metrics from '../../../../code/metrics'

const metrics = start_metrics
({
	statsd:
	{
		...configuration.statsd,
		prefix : 'users'
	}
})

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

	metrics.increment('count')

	return await internal_http.post(`${address_book.authentication_service}/sign-in`,
	{
		...user,
		id
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
