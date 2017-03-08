import { http, errors } from 'web-service'

import store from '../store'

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

	// (`new` is a reserved word, therefore `new_password`)
	api.patch('/password', async function({ old_password, new_password }, { user })
	{
		if (!user)
		{
			throw new errors.Unauthenticated()
		}

		// A previously set up password
		const password = await store.get_user_authentication(user.id, 'password')

		// If a password has been previously set up
		if (password)
		{
			if (!old_password)
			{
				throw new errors.Input_rejected(`"old_password" is required`)
			}

			// Check if the old password matches
			const matches = await check_password(user.id, old_password)

			// If the old password is wrong, return an error
			if (!matches)
			{
				throw new errors.Input_rejected(`Wrong password`)
			}
		}

		// Turning off the password
		if (!new_password)
		{
			if (password)
			{
				await store.delete(password.id)
			}

			return
		}

		// Hashing a password is a CPU-intensive lengthy operation.
		// takes about 60 milliseconds on my machine.
		//
		new_password = await hash_password(new_password)

		if (password)
		{
			// Change password to the new one
			await store.update(password.id,
			{
				value : new_password
			})
		}
		else
		{
			// Create the password
			await store.create
			({
				user  : user.id,
				type  : 'password',
				value : new_password
			})
		}
	})
}

// Hashes a password
async function hash_password(password)
{
	return (await http.get(`${address_book.password_service}/hash`, { password })).hash
}

async function check_password(user_id, password)
{
	const authentication = await store.get_user_authentication(user_id, 'password')
	const hashed_password = authentication.value
	return await http.get(`${address_book.password_service}/matches`, { password, hashed_password })
}