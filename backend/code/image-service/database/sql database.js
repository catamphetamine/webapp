import Knex      from 'knex'
import Bookshelf from 'bookshelf'

import Sql from '../../common/sql'

export default class Sql_store
{
	ready()
	{
		return this.connecting || (this.connecting = this.connect())
	}

	async connect()
	{
		const bookshelf = Bookshelf(Knex(knexfile))

		this.Image = bookshelf.Model.extend
		({
			tableName : 'images'
		})

		this.images = new Sql(this.Image)
	}

	get_batch(skip, amount)
	{
		throw new Error('Not implemented')
	}

	get_with_user(id)
	{
		return this.images.find(id, { withRelated: 'user' })
	}

	async create({ user, type, sizes, files_size, coordinates, taken_at, taken_at_utc0, info })
	{
		const data =
		{
			user : user.id,
			type,
			sizes : JSON.stringify(sizes),
			files_size,
			taken_at,
			taken_at_utc0,
			created_at : new Date()
		}

		console.log('taken_at', taken_at)
		console.log('taken_at_utc0', taken_at_utc0)

		if (coordinates)
		{
			// "from text" is slower
			// data.coordinates = Sql.knex_postgis().geomFromText(`Point(${coordinates.longitude} ${coordinates.latitude})`, 4326)
			data.coordinates = Sql.knex_postgis().longitude_latitude(coordinates.longitude, coordinates.latitude)
		}

		if (Object.keys(info).length > 0)
		{
			data.info = info
		}

		const image = await this.images.create(data)

		return image.id
	}

	delete(id)
	{
		return this.images.remove(id)
	}
}