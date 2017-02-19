import Sql from '../../common/sql'

export default class Sql_store
{
	ready()
	{
		return this.connecting || (this.connecting = this.connect())
	}

	async connect()
	{
		this.access_codes = new Sql('access_codes')
	}

	create(code, user_id)
	{
		return this.access_codes.create({ code, user: user_id })
	}

	get(id)
	{
		return this.access_codes.find(id)
	}

	delete(id)
	{
		return this.access_codes.delete(id)
	}

	update_code(id, code)
	{
		return this.access_codes.update(id, { code })
	}

	get_by_user_id(user_id)
	{
		return this.access_codes.find({ user: user_id })
	}

	succeeded = (id) =>
	{
		return this.access_codes.delete(id)
	}

	failed = (id, attempts, temperature) =>
	{
		return this.access_codes.update(id,
		{
			latest_attempt : new Date(),
			attempts,
			temperature
		})
	}
}