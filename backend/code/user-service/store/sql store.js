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

	async create_user(user)
	{
		return (await this.users.create(user)).id
	}

	// Finds user by `id` or `alias`
	find_user(id)
	{
		// If `id` is numerical, then find user by id
		if (String(parseInt(id)) === String(id))
		{
			return this.find_user_by_id(id)
		}

		// Otherwise, find user by `alias`
		return this.users.find({ alias: id })
	}

	find_user_by_id(id)
	{
		return this.users.find(id)
	}

	find_user_by_email(email)
	{
		return this.users.find({ email })
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

	async is_unique_alias(alias, self_id)
	{
		const user = await this.users.find({ alias })
		return !user || user.id === self_id
	}

	validate_alias(alias)
	{
		return String(parseInt(alias)) !== String(alias)
	}
}