export default class Memory_store
{
	id = 1
	user_authentication = new Map()

	async ready()
	{
	}

	async create(user_id, data)
	{
		this.user_authentication.set(user_id,
		{
			id: this.id++,
			...data
		})
	}

	async get(id)
	{
		for (const [user_id, entry] of this.user_authentication)
		{
			if (entry.id === id)
			{
				return entry
			}
		}
	}

	async get_user_password_authentication(user_id)
	{
		return this.user_authentication.get(user_id)
	}

	async update_password(user_id, password)
	{
		this.user_authentication.get(user_id).password = password
	}

	async failed(id, temperature)
	{
	}

	async succeeded(id)
	{
	}
}