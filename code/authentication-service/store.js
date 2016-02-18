import uid    from 'uid-safe'
import moment from 'moment'
import redis  from 'redis'

Promise.promisifyAll(redis)

function generate_jwt_id()
{
	return uid.sync(24)
}

// user's latest activity time accuracy
function round_user_access_time(time)
{
	return new Date(moment(time).seconds(0).unix() * 1000)
}

class Memory_store
{
	connect()
	{
		this.users = new Map()
		this.id_counter = 0
	}

	create_user(user)
	{
		user = Object.clone(user)

		user.id = String(this.id_counter++)

		this.users.set(user.id, user)
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

	update_user(user)
	{
		this.users.set(user.id, user)
		return Promise.resolve()
	}

	generate_unique_jwt_id(user)
	{
		const token_id = generate_jwt_id()

		if (user.authentication_tokens && user.authentication_tokens[token_id])
		{
			return this.generate_unique_jwt_id(user)
		}

		return token_id
	}

	find_token_by_id(token_id, user_id)
	{
		for (let [user_id, user] of this.users)
		{
			if (exists(user.authentication_tokens))
			{
				for (let token of Object.keys(user.authentication_tokens))
				{
					if (token === token_id)
					{
						return Promise.resolve(user.authentication_tokens[token])
					}
				}
			}
		}

		return Promise.resolve()
	}

	async revoke_token(token_id, user_id)
	{
		const user = await this.find_user_by_id(user_id)
		
		// for in-memory database development testing
		if (!user)
		{
			return
		}

		delete user.authentication_tokens[token_id]
	}

	add_authentication_token(user, jwt_id, ip)
	{
		user.authentication_tokens = user.authentication_tokens || []

		const now = new Date()

		user.authentication_tokens[jwt_id] = { ip, time: now }

		// redundant field for faster latest activity time querying
		user.latest_activity_time = now

		return Promise.resolve()
	}

	async record_access(user, authentication_token_id, ip)
	{
		user = await store.find_user_by_id(user.id)

		const now = round_user_access_time(new Date())

		// update user's online status
		let previous_time = await online_status_store.get_and_set(user.id, new Date())

		if (previous_time)
		{
			previous_time = round_user_access_time(previous_time)
		}

		// console.log('*** previous user access time', previous_time)
		// console.log('*** now user access time', now)

		// if enough time has passed to update this user's latest activity time,
		// then update it
		if (!previous_time || now.getTime() > previous_time.getTime())
		{
			// console.log('*** updating user access time')

			// if (previous_time)
			// {
			// 	console.log('*** previous_time.getTime()', previous_time.getTime())
			// }

			// update access time for this authentication token
			const token = user.authentication_tokens[authentication_token_id]
			token.ip = ip
			token.time = now

			// redundant field for faster latest activity time querying
			user.latest_activity_time = now

			await store.update_user(user)
		}
	}
}

class Mongodb_store
{
	connect()
	{
	}
}

class Memory_online_status_store
{
	connect()
	{
		this.user_sessions = {}
	}

	get(user_id)
	{
		return Promise.resolve(this.user_sessions[user_id])
	}

	get_and_set(user_id, time)
	{
		const previous_time = this.user_sessions[user_id]
		this.user_sessions[user_id] = time
		return Promise.resolve(previous_time)
	}
}

class Redis_online_status_store
{
	prefix = 'user:session:';
	ttl = 10 * 60; // 10 minutes

	connect()
	{
		this.client = redis.createClient
		({
			host      : configuration.redis.host,
			port      : configuration.redis.port,
			auth_pass : configuration.redis.password
		})
	}

	get(user_id)
	{
		return this.client
			.get(this.prefix + user_id)
			.then(result => result ? new Date(result) : null)
	}

	get_and_set(user_id, time)
	{
		return this.client.multi()
			.getset(this.prefix + user_id, time.toISOString())
			.expire(this.prefix + user_id, this.ttl)
			.execAsync()
			.then(result => result[0] ? new Date(result[0]) : null)
	}
}

export const store = configuration.mongodb ? new Mongodb_store() : new Memory_store()
store.connect()

export const online_status_store = configuration.redis ? new Redis_online_status_store() : new Memory_online_status_store()
online_status_store.connect()