export default class Memory_store
{
	users = new Map();
	id_counter = 1;

	ready()
	{
		return Promise.resolve()
	}

	create_user(user)
	{
		user = Object.clone(user)

		user.id = this.id_counter++

		this.users.set(String(user.id), user)

		return Promise.resolve(user.id)
	}

	// Finds user by `id` or `username`
	find_user(id)
	{
		// If `id` is numerical, then find user by id
		if (String(parseInt(id)) === String(id))
		{
			return this.find_user_by_id(id)
		}

		// Otherwise, find user by `username`
		for (let [id, user] of this.users)
		{
			if (user.username === id)
			{
				return user
			}
		}
	}

	find_user_by_id(id)
	{
		return Promise.resolve(this.users.get(String(id)))
	}

	async find_user_by_email(email)
	{
		for (let [id, user] of this.users)
		{
			if (user.email === email)
			{
				return user
			}
		}
	}

	update_user(id, data)
	{
		const user = this.users.get(String(id))

		for (let key of Object.keys(data))
		{
			user[key] = data[key]
		}

		this.users.set(String(user.id), user)

		return Promise.resolve()
	}

	update_picture(id, picture)
	{
		return this.update_user(id,
		{
			picture       : picture.id,
			picture_sizes : picture.sizes
		})
	}

	update_locale(user_id, locale)
	{
		this.find_user_by_id(user_id).locale = locale

		return Promise.resolve()
	}

	async is_unique_username(username, self_id)
	{
		for (let [id, user] of this.users)
		{
			if (id !== self_id && user.username === username)
			{
				return false
			}
		}

		return true
	}

	validate_username(username)
	{
		return String(parseInt(username)) !== String(username)
	}
}