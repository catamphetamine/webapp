import path from 'path'
import fs   from 'fs'

import Knex      from 'knex'
import Bookshelf from 'bookshelf'

function create_store()
{
	if (!fs.existsSync(path.join(Root_folder, 'knexfile.js'))) 
	{
		log.info('PostgreSQL connection is not configured. Using in-memory store.')
		return new Memory_store()
	}

	log.info(`Connecting to PostgreSQL`)
	log.info('(in case of failure with throw ECONNRESET)')

	const knex = Knex(require(path.join(Root_folder, 'knexfile')))

	const bookshelf = Bookshelf(knex)

	const User = bookshelf.Model.extend
	({
		tableName : 'users'
	})

	const Message = bookshelf.Model.extend
	({
		tableName : 'messages',
		from      : () => this.belongsTo(User),
		to        : () => this.belongsTo(User)
	})

	const store =
	{
		create_user(user)
		{
			return new User(user).save(null, { method: 'insert' })
		},

		find_user_by_id(id)
		{
			return new User({ id }).fetch().then(x => x !== null ? x.toJSON() : null)
		},

		find_user_by_email(email)
		{
			return new User({ email }).fetch().then(x => x !== null ? x.toJSON() : null)
		},

		update_user(user)
		{
			return new User(user).save()
		},

		update_locale(user_id, locale)
		{
			return new User({ id: user_id, locale }).save()
		}
	}

	return store
}

class Memory_store
{
	users = new Map();
	// id_counter = 0;

	create_user(user)
	{
		user = Object.clone(user)

		// user.id = this.id_counter++

		this.users.set(String(user.id), user)

		return Promise.resolve(user.id)
	}

	find_user_by_id(id)
	{
		return Promise.resolve(this.users.get(String(id)))
	}

	find_user_by_email(email)
	{
		for (let [user_id, user] of this.users)
		{
			if (user.email === email)
			{
				return Promise.resolve(user)
			}
		}

		return Promise.resolve()
	}

	update_user(user)
	{
		this.users.set(String(user.id), user)

		return Promise.resolve()
	}

	update_locale(user_id, locale)
	{
		this.find_user_by_id(user_id).locale = locale

		return Promise.resolve()
	}
}

const store = create_store()

export default store