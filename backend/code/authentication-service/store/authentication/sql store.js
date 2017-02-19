import Sql from '../../../common/sql'

export default class Sql_store
{
	ready()
	{
		return this.connecting || (this.connecting = this.connect())
	}

	async connect()
	{
		this.authentication = new Sql('authentication')
	}

	create(user_id, data)
	{
		return this.authentication.create({ ...data, user: user_id })
	}

	get(id)
	{
		return this.authentication.find(id)
	}

	get_user_password_authentication(user_id)
	{
		return this.authentication.find
		({
			user : user_id,
			type : 'password'
		})
	}

	update_password(user_id, value)
	{
		return this.authentication.update
		({
			user : user_id,
			type : 'password'
		},
		{
			value
		})
	}

	// Is called on a failed login attempt
	failed = (id, attempts, temperature) =>
	{
		return this.authentication.update(id,
		{
			latest_attempt : new Date(),
			attempts,
			temperature
		})
	}

	// Is called on a successfull login
	succeeded = (id) =>
	{
		return this.authentication.update(id,
		{
			latest_attempt : null,
			attempts       : 0,
			temperature    : 0
		})
	}
}