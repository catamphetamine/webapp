import { http, errors } from 'web-service'

import store from '../store'

// May possibly add something like { alias } in the future
export async function get_user(id, options = {})
{
	const { self, poster } = options

	const user_data = await store.find(id, { include: ['blocked_by']})

	if (!user_data)
	{
		throw new errors.Not_found(`User not found: ${id}`)
	}

	if (poster)
	{
		user_data.poster = await http.get(`${address_book.social_service}/poster/user/${id}`)
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
			user_data.blocked_by = await get_user(user_data.blocked_by, { poster })
		}
	}

	return self ? own_user(user_data) : public_user(user_data)
}

export function get_user_self(id, options = {})
{
	return get_user(id, { ...options, self: true })
}

export function public_user(user)
{
	const fields =
	[
		'id',
		'was_online_at',
		'blocked_at',
		'blocked_by',
		'blocked_reason',
		'poster'
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

		email : user.email,
		roles : user.roles,
		// moderation : user.moderation,
		// switches   : user.switches,

		locale : user.locale
	}

	return result
}
