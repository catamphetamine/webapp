import path from 'path'

import Knex         from 'knex'
import Bookshelf    from 'bookshelf'

export default class Sql_store
{
	ready()
	{
		return this.connecting || (this.connecting = this.connect())
	}

	async connect()
	{
		const knex = Knex(require(path.join(Root_folder, 'knexfile')))

		const bookshelf = Bookshelf(knex)

		this.User = bookshelf.Model.extend
		({
			tableName : 'users'
		})

		// this.Message = bookshelf.Model.extend
		// ({
		// 	tableName : 'messages',
		// 	from      : () => this.belongsTo(this.User),
		// 	to        : () => this.belongsTo(this.User)
		// })
	}

	create_user(user)
	{
		return new this.User(user).save(null, { method: 'insert' })
	}

	find_user_by_id(id)
	{
		return new this.User({ id }).fetch().then(x => x !== null ? x.toJSON() : null)
	}

	find_user_by_email(email)
	{
		return new this.User({ email }).fetch().then(x => x !== null ? x.toJSON() : null)
	}

	update_user(id, data)
	{
		return new this.User({ id }).save(data)
	}

	update_locale(user_id, locale)
	{
		return new this.User({ id: user_id, locale }).save()
	}
}