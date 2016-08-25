export default class Memory_store
{
	users = new Map();
	// id_counter = 0;

	ready()
	{
		return Promise.resolve()
	}

	create_user(user)
	{
		user = Object.clone(user)

		// user.id = this.id_counter++

		this.users.set(String(user.id), user)

		return Promise.resolve(user.id)
	}

	find_user_by_id(id)
	{
		return Promise.resolve(this.users.get(String(id)))
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

	update_locale(user_id, locale)
	{
		this.find_user_by_id(user_id).locale = locale

		return Promise.resolve()
	}
}