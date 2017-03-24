import uuid from 'uuid'

import Sql from '../common/sql'

const Max_aliases_in_history = 10

class Sql_store
{
	ready()
	{
		return this.connecting || (this.connecting = this.connect())
	}

	async connect()
	{
		this.users = new Sql('users')
	}

	create(user)
	{
		return this.users.create(user)
	}

	count()
	{
		return this.users.count()
	}

	find(id)
	{
		return this.users.find(id)
	}

	find_by_email(email)
	{
		return this.users.find({ email })
	}

	find_by_phone(phone)
	{
		return this.users.find({ phone })
	}

	update(id, data)
	{
		return this.users.update(id, data)
	}

	update_locale(user_id, locale)
	{
		return this.users.update(user_id, { locale })
	}
}

export default new Sql_store()