import { http, errors } from 'web-service'

import store from '../store/store'
import { get_user, sign_in, register, own_user } from './user.base'

export default function(api)
{
	api.post('/sign-in', sign_in)
	api.post('/register', register)

	api.get('/was-online-at/:id', async ({ id }) =>
	{
		// Try to fetch user's latest activity time from the current session
		// (is faster and more precise than from a database)
		const latest_recent_activity = await http.get(`${address_book.authentication_service}/latest-recent-activity/${id}`)

		if (latest_recent_activity)
		{
			return latest_recent_activity
		}

		// If there's no current session for the user, 
		// then try to fetch user's latest activity time from the database

		const user = await store.find_user_by_id(id)

		if (!user)
		{
			throw new errors.Not_found(`User not found: ${id}`)
		}

		return user.was_online_at
	})

	api.patch('/was-online-at/:id', async ({ id, date }) =>
	{
		await store.update_user(id, { was_online_at: date })
	})

	api.get('/current', async function({}, { user, internal_http, get_cookie, set_cookie })
	{
		// If no valid JWT token present,
		// then assume this user is not authenticated.
		if (!user)
		{
			return
		}

		// Get user info from the database
		user = await store.find_user_by_id(user.id)

		// If the user wasn't found in the databse
		// (shouldn't happen in normal circumstances)
		// then abort
		if (!user)
		{
			return
		}

		// Return user info
		return own_user(user)
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

		// Update the picture in `users` table
		await store.update_picture(user.id, picture)

		// Delete the previous user picture (if any)
		if (user_data.picture)
		{
			await internal_http.delete(`${address_book.image_service}/api/${user_data.picture}`)
		}

		return picture
	})

	// This pattern can potentially match other GET requests
	// it wasn't intended to match, so placing it in the end.
	api.get('/:id', async function({ id }, { user })
	{
		return await get_user({ id }, { user })
	})
}