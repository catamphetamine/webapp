import store from '../store'

// import {} from './user.base'

api.get('/:id', async function({ id }, { user })
{
	const user_data = await store.find_user_by_id(id)

	if (!user_data)
	{
		throw new Errors.Not_found(`User not found`)
	}

	return (user && id === user.id) ? own_user(user_data) : public_user(user_data)
})

api.post('/', async function(user)
{
	if (!exists(user.name))
	{
		throw new Errors.Input_missing(`"name" is required`)
	}

	await store.create_user(user)
})

// api.patch('/locale', async function()
// {
// 	await set_locale.apply(this, arguments)
// })

// api.patch('/:id', async function({ id, name })
// {
// 	id = parseInt(id)

// 	const user = await store.find_user_by_id(id)

// 	if (!user)
// 	{
// 		throw new Errors.Not_found(`User not found`)
// 	}

// 	user.name = name

// 	await store.update_user(user)
// })

// api.post('/:id/picture', async function({ id, file_name })
// {
// 	const user = await store.find_user_by_id(id)

// 	if (!user)
// 	{
// 		throw new Errors.Not_found(`User not found`)
// 	}

// 	user.picture = file_name

// 	await store.update_user(user)
// })

function public_user(user)
{
	const result =
	{
		id      : user.id,
		name    : user.name,
		city    : user.city,
		country : user.country
	}

	return result
}

function own_user(user)
{
	const result = 
	{
		...public_user(user),

		role       : user.role,
		// moderation : user.moderation,
		// switches   : user.switches,

		locale : user.locale
	}

	return result
}