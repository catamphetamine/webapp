export default class memory_database
{
	db = {}
	id = 1

	ready()
	{
		return Promise.resolve()
	}

	get_batch(skip, amount)
	{
		const result = {}

		let i = 0
		for (let key of Object.keys(this.db))
		{
			if (skip)
			{
				skip--
			}
			else if (amount)
			{
				result[key] = this.db[key]
				amount--
			}
			else
			{
				break
			}

			i++
		}

		return Promise.resolve(result)
	}

	get_with_user(id)
	{
		return Promise.resolve(this.db[id])
	}

	create({ user, type, sizes, files_size, coordinates, taken_at, taken_at_utc0, info })
	{
		const id = this.id
		this.id++

		this.db[id] =
		{
			user : user.id,
			type,
			sizes,
			files_size,
			taken_at,
			taken_at_utc0,
			info,
			coordinates,
			created_at : new Date()
		}

		return Promise.resolve(id)
	}

	delete(id)
	{
		delete this.db[id]
		return Promise.resolve()
	}

	async increase_user_images_size(user, size)
	{
		return Promise.resolve()
	}

	async decrease_user_images_size(user, size)
	{
		return Promise.resolve()
	}
}