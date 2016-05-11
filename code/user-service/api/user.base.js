import store from '../store'

export async function get_user({ id }, { user })
{
	const user_data = await store.find_user_by_id(id)

	if (!user_data)
	{
		throw new Errors.Not_found(`User not found`)
	}

	return (user && id === user.id) ? own_user(user_data) : public_user(user_data)
}

function public_user(user)
{
	const fields =
	[
		'id',
		'name',
		'place',
		'country',
		'picture'
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