import MongoDB from '../common/mongodb'

// MongoDB is not used now, so this file may be outdated
export default class mongodb_database extends MongoDB
{
	async ready()
	{
		return this.connecting || (this.connecting = this.connect())
	}

	async get_batch(skip, amount)
	{
		return this.collection('images').query({}, { skip, amount })
	}

	async get_with_user(id)
	{
		let result = await this.collection('images').get_by_id(id)

		// Convert `_id` ObjectId to `id` string
		result = this.to_object(result)
		
		// Convert ObjectId to string
		result.user = result.user.toString()

		return result
	}

	// Returns image id
	async create({ user, type, sizes, files_size, coordinates, taken_at, taken_at_utc0, info })
	{
		const result = await this.collection('images').insertAsync
		({
			user : user.id,
			type,
			sizes,
			files_size,
			taken_at,
			taken_at_utc0,
			info,
			location,
			created_at : new Date()
		})

		return this.inserted_id(result).toString()
	}

	async delete(id)
	{
		await this.collection('images').remove_by_id(id)
	}

	async increase_user_images_size(user, size)
	{
		const result = await this.collection('user_image_stats').updateAsync
		({
			user: user.id
		},
		{
			$inc:
			{
				files_size : size,
				count      : 1
			}
		})

		if (!result.result.nModified)
		{
			await this.collection('user_image_stats').insertAsync
			({
				user       : user.id,
				files_size : size,
				count      : 1
			})
		}
	}

	async decrease_user_images_size(user, size)
	{
		await this.collection('user_image_stats').updateAsync
		({
			user: user.id
		},
		{
			$inc:
			{
				files_size : -size,
				count      : -1
			}
		})
	}
}