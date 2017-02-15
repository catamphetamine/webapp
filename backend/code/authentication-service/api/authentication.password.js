import { http, errors } from 'web-service'

export default function(api)
{
	api.post('/authentication-data', async function({ id, password })
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
		await store.create_authentication_data(id, { password })
	})

	api.get('/password/check', async function({ password }, { user })
	{
		if (!user)
		{
			throw new errors.Unauthenticated()
		}

		if (!exists(password))
		{
			throw new errors.Input_rejected(`"password" is required`)
		}

		// Get authentication data by user's `id`
		const authentication_data = await this.store.get_info(user_id)

		const throttling_info =
		{
			temperature    : authentication_data.authentication_attempt_temperature,
			latest_attempt : authentication_data.authentication_attempt_failed_at
		}

		// Check if the password matches
		const matches = await throttling.attempt(throttling_info, async () =>
		{
			return await http.get(`${address_book.password_service}/check`,
			{
				password,
				hashed_password : authentication_data.password
			})
		})

		// If the password is wrong, return an error
		if (!matches)
		{
			throw new errors.Input_rejected(`Wrong password`, { field: 'password' })
		}
	})

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