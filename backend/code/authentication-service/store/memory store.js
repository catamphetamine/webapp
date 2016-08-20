import uid from 'uid-safe'

import { round_user_access_time } from './store'
import online_status_store from './online/online store'

// if no MongoDB connection is configured,
// then use in-memory store for demoing
export default class Memory_store
{
	users = new Map()
	id_counter = 1

	async ready()
	{
		await online_status_store.ready()
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
			created : now,
			// redundant field for faster access token sorting
			latest_access : now,
			history : [{ ip, time: now }]
		})

		// redundant field for faster latest activity time querying
		user.latest_activity_time = now

		return authentication_token_id
	}

	async record_access(user, authentication_token_id, ip)
	{
		user = await store.find_user_by_id(user.id)

		// update user's online status
		const previous_timestamp = await online_status_store.get_and_set(user.id, authentication_token_id, ip, Date.now())

		// if enough time has passed to update this user's latest activity time,
		// then update it
		if (!previous_timestamp || Date.now() - previous_timestamp >= 60 * 1000)
		{
			const now = round_user_access_time(new Date())

			// update access time for this authentication token
			const token = user.authentication_tokens.find_by({ id: authentication_token_id })

			// redundant field for faster access token sorting
			token.latest_access = now

			const this_ip_access = token.history.find_by({ ip })

			if (this_ip_access)
			{
				this_ip_access.time = now
			}
			else
			{
				token.history.push({ ip, time: now })
			}

			// redundant field for faster latest activity time querying
			user.latest_activity_time = now
		}
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