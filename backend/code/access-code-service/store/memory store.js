export default class Memory_store
{
	codes = new Map()
	id = 0

	async ready()
	{
	}

	async create(code, user_id)
	{
		const id = this.id++
		this.codes.set(id, { id, code, user: user_id })
	}

	async get(id)
	{
		this.codes.get(id)
	}

	async delete(id)
	{
		this.codes.delete(id)
	}

	async update_code(id, code)
	{
		this.codes.get(entry.id).code = code
	}

	async get_by_user_id(user_id)
	{
		for (let [id, entry] of this.codes)
		{
			if (entry.user === user_id)
			{
				return entry
			}
		}
	}

	async succeeded(id)
	{
	}

	async failed(id, temperature)
	{
	}
}