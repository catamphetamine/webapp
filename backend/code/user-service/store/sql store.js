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

	update_locale(user_id, locale)
	{
		return this.users.update(user_id, { locale })
	}
}