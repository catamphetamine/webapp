import { http, errors } from 'web-service'

import store from '../store/store'
import { get_user } from './user.base'

export default function(api)
{
	api.get('/:id', async function({ id }, { user })
	{
		return await get_user({ id }, { user })
	})

	api.post('/', async function(user)
	{
		if (!exists(user.name))
		{
			throw new errors.Input_rejected(`"name" is required`)
		}

		await store.create_user(user)
	})

	// api.patch('/settings', async function({ xxx }, { user })
	// {
	// 	if (!user)
	// 	{
	// 		throw new errors.Unauthenticated()
	// 	}
	//
	// 	await store.update_user(user.id, { xxx })
	// })

	api.patch('/email', async function({ email }, { user, authentication_token, internal_http })
	{
		if (!email)
		{
			throw new errors.Input_rejected('email')
		}

		if (!user)
		{
			throw new errors.Unauthenticated()
		}

		await store.update_user(user.id, { email })

		await internal_http.patch(`${address_book.authentication_service}/email`, { email })
	})

	api.patch('/', async function(data, { user })
	{
		if (!user)
		{
			throw new errors.Unauthenticated()
		}

		if (!data.name)
		{
			throw new errors.Input_rejected(`"name" is required`)
		}
		
		await store.update_user(user.id,
		{
			name    : data.name,
			country : data.country,
			place   : data.place
		})

		return await get_user({ id: user.id }, { user })
	})

	api.post('/picture', async function(picture, { user, authentication_token, internal_http })
	{
		if (!user)
		{
			throw new errors.Unauthenticated()
		}

		const user_data = await get_user(user, { user })

		// Save the uploaded picture
		picture = await internal_http.post
		(
			`${address_book.image_service}/api/save`,
			{ type: 'user_picture', image: picture }
		)

		// Store only the picture `id` and also `sizes`
		// (to avoid joining the giant `images` table) in `users` table,
		// and not disclose any private info like the image GPS coordinates.
		picture =
		{
			id    : picture.id,
			sizes : picture.sizes
		}

		// `file_size`s aren't needed, so remove them too to free a bit of space
		for (let size of picture.sizes)
		{
			delete size.file_size
		}

		// Update the picture in `users` table
		await store.update_user(user.id, { picture })

		// Delete the previous user picture (if any)
		if (user_data.picture)
		{
			await internal_http.delete(`${address_book.image_service}/api/${user_data.picture.id}`)
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
	// 		throw new errors.Not_found(`User not found`)
	// 	}

	// 	user.name = name

	// 	await store.update_user(user)
	// })

	// api.post('/:id/picture', async function({ id, file_name })
	// {
	// 	const user = await store.find_user_by_id(id)

	// 	if (!user)
	// 	{
	// 		throw new errors.Not_found(`User not found`)
	// 	}

	// 	user.picture = file_name

	// 	await store.update_user(user)
	// })
}