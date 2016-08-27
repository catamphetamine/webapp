import uid from 'uid-safe'

import { sort_tokens_by_relevance } from './store'
import online_status_store from './online/online store'

// if no MongoDB connection is configured,
// then use in-memory store for demoing
export default class Memory_store
{
	users = new Map()
	tokens = []

	async ready()
	{
	}

	async create_authentication_data(user_id, data)
	{
		this.users.set(user_id, data)
	}

	async get_authentication_data(user_id)
	{
		return this.users.get(user_id)
	}

	async update_password(user_id, password)
	{
		this.users.get(user_id).password = password
	}

	async find_token_by_id(token_id)
	{
		return this.tokens.filter(token => token.id === token_id)[0]
	}

	async revoke_token(token_id)
	{
		const token = await this.find_token_by_id(token_id)
		token.revoked_at = new Date()
	}

	async add_authentication_token(user_id, ip)
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

		const now = new Date()

		const authentication_token_id = await generate_unique_jwt_id()

		this.tokens.push
		({
			id      : authentication_token_id,
			created_at : now,
			user : user_id,
			history : [{ ip, updated_at: now }]
		})

		return authentication_token_id
	}

	async record_access(user_id, authentication_token_id, ip, now)
	{
		const token = await this.find_token_by_id(authentication_token_id)

		const this_ip_access = token.history.find_by({ ip })

		if (this_ip_access)
		{
			this_ip_access.updated_at = now
		}
		else
		{
			token.history.push({ ip, updated_at: now })
		}
	}

	async get_tokens(user_id)
	{
		return this.tokens.filter(token => token.user === user_id)
	}

	async set_login_temperature(authentication_data_id, temperature)
	{
	}

	async set_latest_failed_login_attempt(authentication_data_id, temperature)
	{
	}

	async clear_latest_failed_login_attempt(authentication_data_id)
	{
	}
}