import uid from 'uid-safe'

import online_status_store from './online/online store'

// if no MongoDB connection is configured,
// then use in-memory store for demoing
export default class Memory_store
{
	users = new Map()
	id_counter = 1

	ready()
	{
		return Promise.resolve()
	}

	create_user(user)
	{
		user = Object.clone(user)

		user.id = String(this.id_counter++)

		this.users.set(user.id, user)

		return Promise.resolve(user.id)
	}

	find_user_by_id(id)
	{
		return Promise.resolve(this.users.get(id))
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

	update_email(user_id, email)
	{
		this.users.get(user_id).email = email

		return Promise.resolve(true)
	}

	update_password(user_id, password)
	{
		this.users.get(user_id).password = password

		return Promise.resolve(true)
	}

	find_token_by_id(token_id)
	{
		for (let [user_id, user] of this.users)
		{
			if (exists(user.authentication_tokens))
			{
				const token = user.authentication_tokens.find_by({ id: token_id })

				if (token)
				{
					return Promise.resolve(token)
				}
			}
		}

		return Promise.resolve()
	}

	async revoke_token(token_id)
	{
		const token = await this.find_token_by_id(token_id)
		token.revoked = new Date()
	}

	async add_authentication_token(user, ip)
	{
		const generate_unique_jwt_id = async () =>
		{
			const token_id = generate_jwt_id()

			const token = await this.find_token_by_id(token_id)

			if (token)
			{
				return await generate_unique_jwt_id()
			}

			return token_id
		}

		function generate_jwt_id()
		{
			// 24 bytes
			return uid.sync(24)
		}

		user.authentication_tokens = user.authentication_tokens || []

		const now = new Date()

		const authentication_token_id = await generate_unique_jwt_id()

		user.authentication_tokens.push
		({
			id      : authentication_token_id,
			created_at : now,
			// redundant field for faster access token sorting
			latest_access : now,
			user : user.id,
			history : [{ ip, updated_at: now }]
		})

		// redundant field for faster latest activity time querying
		user.was_online_at = now

		return authentication_token_id
	}

	async record_access(user_id, authentication_token_id, ip, now)
	{
		const user = this.find_user_by_id(user_id)

		// update access time for this authentication token
		const token = user.authentication_tokens.find_by({ id: authentication_token_id })

		// redundant field for faster access token sorting
		token.latest_access = now

		const this_ip_access = token.history.find_by({ ip })

		if (this_ip_access)
		{
			this_ip_access.updated_at = now
		}
		else
		{
			token.history.push({ ip, updated_at: now })
		}

		// redundant field for faster latest activity time querying
		user.was_online_at = now
	}

	get_tokens(user_id)
	{
		return Promise.resolve(this.users.get(user_id).authentication_tokens)
	}

	set_login_temperature(user_id, temperature)
	{
		return Promise.resolve()
	}

	set_latest_failed_login_attempt(user_id, temperature)
	{
		return Promise.resolve()
	}

	clear_latest_failed_login_attempt(user_id)
	{
		return Promise.resolve()
	}
}