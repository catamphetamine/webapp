import { http, errors } from 'web-service'

import store from '../store'

// May possibly add something like { alias } in the future
export async function get_user(id, options = {})
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
			user_data.blocked_by = await get_user(user_data.blocked_by)
		}
	}

	const { self } = options
	return self ? own_user(user_data) : public_user(user_data)
}

export function get_user_self(id, options = {})
{
	options.self = true
	return get_user(id, options)
}

export function public_user(user)
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

function own_user(user)
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
