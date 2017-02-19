import { http, errors } from 'web-service'

import store from '../store/authentication/store'

export default function(api)
{
	// Checks password
	api.get('/password/check', async function({ password }, { user })
	{
		if (!user)
		{
			throw new errors.Input_rejected()
		}

		// Check if the password matches
		if (!await check_password(user.id, password))
		{
			throw new errors.Input_rejected('Wrong password', { field: 'password' })
		}
	})

	// Creates a "password" authentication for a user
	api.post('/password', async function({ id, password })
	{
		// Hash the password.
		//
		// Hashing a password is a CPU-intensive lengthy operation.
		// takes about 60 milliseconds on my machine.
		//
		// Maybe could be offloaded from node.js
		// to some another multithreaded backend.
		//
		password = await hash_password(password)

		// Add the hashed password to the dabase
		await store.create(id,
		{
			type  : 'password',
			value : password
		})
	})

	// (`new` is a reserved word, therefore `new_password`)
	api.patch('/password', async function({ old_password, new_password }, { user })
	{
		if (!user)
		{
			throw new errors.Unauthenticated()
		}

		if (!old_password)
		{
			throw new errors.Input_rejected(`"old_password" is required`)
		}

		if (!new_password)
		{
			throw new errors.Input_rejected(`"new_password" is required`)
		}

		// Check if the old password matches
		const matches = await check_password(user.id, old_password)

		// If the old password is wrong, return an error
		if (!matches)
		{
			throw new errors.Input_rejected(`Wrong password`)
		}

		// Hashing a password is a CPU-intensive lengthy operation.
		// takes about 60 milliseconds on my machine.
		//
		new_password = await hash_password(new_password)

		// Change password to the new one
		await store.update_password(user.id, new_password)
	})
}

// Hashes a password
async function hash_password(password)
{
	return (await http.get(`${address_book.password_service}/hash`, { password })).hash
}

async function check_password(user_id, password)
{
	const authentication = await store.get_user_password_authentication(user_id)
	const hashed_password = authentication.value
	return await http.get(`${address_book.password_service}/matches`, { password, hashed_password })
}