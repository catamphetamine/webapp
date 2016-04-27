import store from '../store'

import { get_user } from './user.base'

api.get('/:id', async function({ id }, { user })
{
	return await get_user({ id }, { user })
})

api.post('/', async function(user)
{
	if (!exists(user.name))
	{
		throw new Errors.Input_missing(`"name" is required`)
	}

	await store.create_user(user)
})

api.patch('/', async function(data, { user })
{
	if (!user)
	{
		throw new Errors.Unauthenticated()
	}
	
	await store.update_user(user.id, data)

	return await get_user({ id: user.id }, { user })
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