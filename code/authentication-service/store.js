import moment from 'moment'
import uid    from 'uid-safe'
import redis  from 'redis'

import MongoDB from '../common/mongodb'

Promise.promisifyAll(redis)

// user's latest activity time accuracy
function round_user_access_time(time)
{
	return new Date(moment(time).seconds(0).unix() * 1000)
}

// if no MongoDB connection is configured,
// then use in-memory store for demoing
class Memory_store
{
	connect()
	{
		this.users = new Map()
		this.id_counter = 1

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
		this.users[user_id].email = email

		return Promise.resolve()
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

		const now = round_user_access_time(new Date())

		// update user's online status
		let previous_time = await online_status_store.get_and_set(user.id, new Date())

		if (previous_time)
		{
			previous_time = round_user_access_time(previous_time)
		}

		// if enough time has passed to update this user's latest activity time,
		// then update it
		if (!previous_time || now.getTime() > previous_time.getTime())
		{
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

// if MongoDB is installed and configured, use it
class Mongodb_store extends MongoDB
{
	async create_user(user)
	{
		const result = await this.collection('user_authentication').insertAsync(user)
		return this.inserted_id(result).toString()
	}

	async find_user_by_id(id)
	{
		const result = await this.collection('user_authentication').get_by_id(id)
		return this.to_object(result)
	}

	async find_user_by_email(email)
	{
		const result = await this.collection('user_authentication').findOneAsync({ email })
		return this.to_object(result)
	}

	async find_token_by_id(token_id)
	{
		const token = await this.collection('authentication_tokens').get_by_id(token_id)

		return this.to_object(token)
	}

	async update_email(user_id, email)
	{
		const result = await this.collection('user_authentication').update_by_id(user_id, { $set: { email } })
		return result.result.n === 1
	}

	async revoke_token(token_id)
	{
		// // remove the token from user data
		// await this.collection('user_authentication').update_by_id(user_id,
		// {
		// 	$pull:
		// 	{
		// 		authentication_tokens: this.ObjectId(token_id)
		// 	}
		// })
		//
		// // remove the token from the database
		// await this.collection('authentication_tokens').remove_by_id(token_id)

		await this.collection('authentication_tokens').update
		({
			_id     : this.ObjectId(token_id),
			revoked : { $exists: false }
		},
		{
			$set:
			{
				revoked: new Date()
			}
		})
	}

	async add_authentication_token(user, ip)
	{
		const now = new Date()

		// add the token to the database
		const authentication_token_id = (await this.collection('authentication_tokens').insertAsync
		({
			user_id : this.ObjectId(user.id),
			created : now,

			// redundant field for faster access token sorting
			latest_access : now,

			history:
			[{
				ip,
				time: now
			}]
		}))
		.insertedIds[0]

		// add the token to user data
		await this.collection('user_authentication').update_by_id(user.id,
		{
			$set:
			{
				// redundant field for faster latest activity time querying
				latest_activity_time: now
			},

			$push:
			{
				authentication_tokens: this.ObjectId(authentication_token_id)
			}
		})

		return authentication_token_id.toString()
	}

	async record_access(user, authentication_token_id, ip)
	{
		const now = round_user_access_time(new Date())

		// update user's online status
		let previous_time = await online_status_store.get_and_set(user.id, new Date())

		if (previous_time)
		{
			previous_time = round_user_access_time(previous_time)
		}

		// if enough time has passed to update this user's latest activity time,
		// then update it
		if (!previous_time || now.getTime() > previous_time.getTime())
		{
			// update user's `latest_activity_time`
			await this.collection('user_authentication').update_by_id(user.id,
			{
				$set:
				{
					// redundant field for faster latest activity time querying
					latest_activity_time: now
				}
			})

			// update token access information
			await this.collection('authentication_tokens').updateOneAsync
			({
				_id: this.ObjectId(authentication_token_id),
				'history.ip': ip
			},
			{
				$set:
				{
					// redundant field for faster access token sorting
					latest_access: now,

					'history.$': { ip, time: now }
				}
			})
		}
	}

	async get_tokens(user_id)
	{
		return this.to_objects(await this.collection('authentication_tokens').query
		({
			user_id: this.ObjectId(user_id)
		},
		{
			sort: { latest_access: -1 }
		}))
	}

	async set_login_temperature(user_id, temperature)
	{
		await this.collection('user_authentication').update_by_id(user_id,
		{
			$set:
			{
				'latest_failed_login_attempt.temperature': temperature
			}
		})
	}

	async set_latest_failed_login_attempt(user_id, temperature)
	{
		await this.collection('user_authentication').update_by_id(user_id,
		{
			$set:
			{
				latest_failed_login_attempt:
				{
					when: new Date(),
					temperature
				}
			}
		})
	}

	async clear_latest_failed_login_attempt(user_id)
	{
		await this.collection('user_authentication').update_by_id(user_id,
		{
			$unset:
			{
				latest_failed_login_attempt: true
			}
		})
	}
}

// if no Redis connection is configured,
// then use in-memory store for demoing
class Memory_online_status_store
{
	connect()
	{
		this.user_sessions = {}

		return Promise.resolve()
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

// if Redis is installed and configured, use it
class Redis_online_status_store
{
	prefix = 'user:session:'
	ttl = 10 * 60 // 10 minutes

	connect()
	{
		// Redis caches commands until connection is established
		this.client = redis.createClient
		({
			host      : configuration.redis.host,
			port      : configuration.redis.port,
			auth_pass : configuration.redis.password
		})

		return Promise.resolve()
	}

	get(user_id)
	{
		return this.client
			.getAsync(this.prefix + user_id)
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

export const online_status_store = configuration.redis ? new Redis_online_status_store() : new Memory_online_status_store()

export function connect()
{
	return Promise.all
	([
		store.connect(),
		online_status_store.connect()
	])
}