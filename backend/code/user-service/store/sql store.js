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

		this.User = bookshelf.Model.extend
		({
			tableName : 'users'
		})

		this.users = new Sql(this.User)
	}

	find_user_by_id(id)
	{
		return this.users.find(id)
	}

	update_user(id, data)
	{
		return this.users.update(id, data)
	}

	update_picture(id, picture)
	{
		// Store the picture `id` and also picture `sizes`
		// (to avoid joining the giant `images` table)
		return this.update_user(id,
		{
			picture : picture.id,

			// `file_size`s aren't needed, so remove them too to free a bit of space
			picture_sizes : JSON.stringify(picture.sizes.map((size) =>
			({
				name   : size.name,
				width  : size.width,
				height : size.height
			})))
		})
	}

	update_locale(user_id, locale)
	{
		return this.users.update(user_id, { locale })
	}
}