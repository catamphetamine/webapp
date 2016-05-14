import store from '../store'
import http from '../../common/http'

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

// api.patch('/settings', async function({ xxx }, { user })
// {
// 	if (!user)
// 	{
// 		throw new Errors.Unauthenticated()
// 	}
//
// 	await store.update_user(user.id, { xxx })
// })

api.patch('/email', async function({ email }, { user, authentication_token })
{
	if (!email)
	{
		throw new Errors.Input_missing('email')
	}

	if (!user)
	{
		throw new Errors.Unauthenticated()
	}

	await store.update_user(user.id, { email })

	await http.patch
	(
		`${address_book.authentication_service}/email`,
		{ email },
		{ headers: { Authorization: `Bearer ${authentication_token}` } }
	)
})

api.patch('/', async function(data, { user })
{
	if (!user)
	{
		throw new Errors.Unauthenticated()
	}
	
	await store.update_user(user.id,
	{
		name    : data.name,
		country : data.country,
		place   : data.place
	})

	return await get_user({ id: user.id }, { user })
})

api.post('/picture', async function(picture, { user, authentication_token })
{
	if (!user)
	{
		throw new Errors.Unauthenticated()
	}

	const user_data = await get_user(user, { user })

	picture = await http.post
	(
		`${address_book.image_service}/api/save`,
		{ type: 'user_picture', image: picture },
		{ headers: { Authorization: `Bearer ${authentication_token}` } }
	)

	await store.update_user(user.id, { picture })

	if (user_data.picture)
	{
		await http.delete
		(
			`${address_book.image_service}/api`,
			{ id: user_data.picture.id },
			{ headers: { Authorization: `Bearer ${authentication_token}` } }
		)
	}

	return picture
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