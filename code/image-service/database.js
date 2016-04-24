import MongoDB from '../common/mongodb'

class memory_database
{
	connect()
	{
		this.db = {}
		this.id = 1

		return Promise.resolve()
	}

	get(id)
	{
		return Promise.resolve(this.db[id])
	}

	create(user, type, info)
	{
		const id = this.id
		this.id++

		this.db[id] =
		{
			user    : user.id,
			created : new Date(),
			type,
			info
		}

		return Promise.resolve(id)
	}

	delete(id)
	{
		delete this.db[id]
		return Promise.resolve()
	}
}

class mongodb_database extends MongoDB
{
	async get(id)
	{
		let result = await this.collection('images').get_by_id(id)

		// Convert `_id` ObjectId to `id` string
		result = this.to_object(result)
		
		// Convert ObjectId to string
		result.user = result.user.toString()

		return result
	}

	async create(user, type, info)
	{
		const result = await this.collection('images').insertAsync
		({
			user    : this.ObjectId(user.id),
			created : new Date(),
			type,
			info
		})

		return this.inserted_id(result).toString()
	}

	async delete(id)
	{
		await this.collection('images').remove_by_id(id)
	}
}

const database = configuration.mongodb ? new mongodb_database() : new memory_database()
// const database = new memory_database()

export function connect()
{
	return database.connect()
}

export default database