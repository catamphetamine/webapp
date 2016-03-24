import uid    from 'uid-safe'

import moment         from 'moment'
import redis          from 'redis'

import { MongoClient, ObjectId } from 'mongodb'

Promise.promisifyAll(MongoClient)

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

	async revoke_token(token_id, user_id)
	{
		const user = await this.find_user_by_id(user_id)
		
		// for in-memory database development testing
		if (!user)
		{
			return
		}

		user.authentication_tokens.remove(user.authentication_tokens.find_by({ id: token_id }))
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
			id: authentication_token_id,
			history: [{ ip, time: now }]
		})

		// redundant field for faster latest activity time querying
		user.latest_activity_time = now

		return Promise.resolve(authentication_token_id)
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
}

// if MongoDB is installed and configured, use it
class Mongodb_store
{
	async connect()
	{
		// mongoose caches commands until it connects to MongoDB,
		// so waiting for connection isn't strictly required

		// config.autoIndex = _development_
		const db = await MongoClient.connect(`mongodb://${configuration.mongodb.user}:${configuration.mongodb.password}@${configuration.mongodb.host}:${configuration.mongodb.port}/${configuration.mongodb.database}`,
		{
			// https://docs.mongodb.org/manual/reference/write-concern/
			db: { w: 'majority', wtimeout: 10000 } 
		})

		this.user_authentication = db.collection('user_authentication')
		this.authentication_tokens = db.collection('authentication_tokens')

		Promise.promisifyAll(this.user_authentication)
		Promise.promisifyAll(this.authentication_tokens)
	}

	async create_user(user)
	{
		const result = await this.user_authentication.insertAsync(user)
		return result.ops[0]._id.toString()
	}

	async find_user_by_id(id)
	{
		const result = await this.user_authentication.findOneAsync({ _id: ObjectId(id) })
		return mongodb_to_object(result)
	}

	async find_user_by_email(email)
	{
		const result = await this.user_authentication.findOneAsync({ email })
		return mongodb_to_object(result)
	}

	async find_token_by_id(token_id)
	{
		const token = await this.authentication_tokens.findOneAsync
		({
			_id: ObjectId(token_id)
		})

		return mongodb_to_object(token)
	}

	async revoke_token(token_id, user_id)
	{
		// remove the token from user data
		await this.user_authentication.updateOneAsync
		({
			_id: ObjectId(user_id)
		},
		{
			$pull:
			{
				authentication_tokens: ObjectId(token_id)
			}
		})

		// remove the token from the database
		await this.authentication_tokens.removeAsync
		({
			_id: ObjectId(token_id)
		})
	}

	async add_authentication_token(user, ip)
	{
		const now = new Date()

		// add the token to the database
		const authentication_token_id = (await this.authentication_tokens.insertAsync
		({
			user_id : ObjectId(user.id),

			history:
			[{
				ip,
				time: now
			}]
		}))
		.insertedIds[0]

		// add the token to user data
		await this.user_authentication.updateOneAsync
		({
			_id: ObjectId(user.id)
		},
		{
			$set:
			{
				// redundant field for faster latest activity time querying
				latest_activity_time: now
			},

			$push:
			{
				authentication_tokens: ObjectId(authentication_token_id)
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
			await this.user_authentication.updateOneAsync
			({
				_id: ObjectId(user.id)
			},
			{
				$set:
				{
					// redundant field for faster latest activity time querying
					latest_activity_time: now
				}
			})

			// update token access information
			await this.authentication_tokens.updateOneAsync
			({
				_id: ObjectId(authentication_token_id),
				'history.ip': ip
			},
			{
				$set:
				{
					'history.$': { ip, time: now }
				}
			})
		}
	}
}

// converts mongodb mongoose entity to JSON object
function mongodb_to_object(entity)
{
	if (!entity)
	{
		return
	}

	const object = entity //.toObject()
	object.id = object._id.toString()
	delete object._id

	return object
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
	prefix = 'user:session:';
	ttl = 10 * 60; // 10 minutes

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