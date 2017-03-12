import Sql from '../common/sql'

// One minute
const Multifactor_authentication_lifetime = 1 * 60 * 1000

class Sql_store
{
	ready()
	{
		return this.connecting || (this.connecting = this.connect())
	}

	async connect()
	{
		this.authentication = new Sql('authentication')
		this.multifactor_authentication = new Sql('multifactor_authentication')
	}

	create(data)
	{
		return this.authentication.create(data)
	}

	create_multifactor_authentication(id, user_id, action, extra, pending_authentications, previous_one)
	{
		const multifactor_authentication =
		{
			id,
			user: user_id,
			action,
			extra,
			pending: JSON.stringify(pending_authentications)
		}

		// So that a possible attacker couldn't get away with
		// constantly recreating a multifactor authentication
		if (previous_one)
		{
			multifactor_authentication.temperature    = previous_one.temperature
			multifactor_authentication.latest_attempt = previous_one.latest_attempt
			multifactor_authentication.attempts       = previous_one.attempts
		}

		return this.multifactor_authentication.create(multifactor_authentication)
	}

	async update_multifactor_authentication_pending(id, pending)
	{
		await this.multifactor_authentication.update(id,
		{
			pending: JSON.stringify(pending)
		})
	}

	// Removes this authentication from multifactor authentication items list
	// and returns `true` if no more authentications are pending.
	async update_multifactor_authentication_being_authenticated(id, authenticated_id)
	{
		const multifactor_authentication = await this.multifactor_authentication.find(id)

		if (multifactor_authentication.pending.length === 0)
		{
			throw new Error('No pending authentications in a multifactor authentication')
		}

		const pending = multifactor_authentication.pending.filter(authentication => authentication.id !== authenticated_id)

		if (multifactor_authentication.pending.length === pending.length)
		{
			throw new Error('Not found')
		}

		await this.update_multifactor_authentication_pending(multifactor_authentication.id, pending)

		if (pending.length > 0)
		{
			return pending
		}

		await this.multifactor_authentication.update(multifactor_authentication.id,
		{
			expires: new Date(Date.now() + Multifactor_authentication_lifetime)
		})
	}

	get(id)
	{
		return this.authentication.find(id)
	}

	get_multifactor_authentication(criteria)
	{
		return this.multifactor_authentication.find(criteria)
	}

	get_user_authentication(user_id, type)
	{
		return this.authentication.find
		({
			user : user_id,
			type
		})
	}

	get_user_multifactor_authentication(user_id, action)
	{
		return this.multifactor_authentication.find
		({
			user : user_id,
			action
		})
	}

	update(id, data)
	{
		return this.authentication.update(id, data)
	}

	delete(id)
	{
		return this.authentication.delete(id)
	}

	delete_multifactor_authentication(id)
	{
		return this.multifactor_authentication.delete(id)
	}

	// Is called on a failed login attempt
	failed = (id, attempts, temperature) =>
	{
		return this.multifactor_authentication.update(id,
		{
			latest_attempt : new Date(),
			attempts,
			temperature
		})
	}

	// Is called on a successfull login
	succeeded = (id) =>
	{
		return this.multifactor_authentication.update(id,
		{
			latest_attempt : null,
			attempts       : 0,
			temperature    : 0
		})
	}
}

export default new Sql_store()