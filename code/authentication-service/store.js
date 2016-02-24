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

	// update_user(user)
	// {
	// 	this.users.set(user.id, user)
	// 	return Promise.resolve()
	// }

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

	add_authentication_token(user, authentication_token_id, ip)
	{
		user.authentication_tokens = user.authentication_tokens || {}

		const now = new Date()

		user.authentication_tokens[authentication_token_id] = { ip, time: now }

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

		// if enough time has passed to update this user's latest activity time,
		// then update it
		if (!previous_time || now.getTime() > previous_time.getTime())
		{
			// update access time for this authentication token
			const token = user.authentication_tokens[authentication_token_id]
			token.ip = ip
			token.time = now

			// redundant field for faster latest activity time querying
			user.latest_activity_time = now

			// await store.update_user(user)
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

		this.user_authentications = db.collection('user_authentications')

		Promise.promisifyAll(this.user_authentications)

		// const User_authentication_schema = mongoose.Schema
		// ({
		// 	// id       : mongoose.Schema.Types.ObjectId, // 12 bytes
		// 	email    : String, // mongoose.Schema.Types.Email,
		// 	password : String,

		// 	// redundant field for faster latest activity time querying
		// 	latest_activity_time : Date,

		// 	authentication_tokens:
		// 	{
		// 		token_id: 
		// 		{
		// 			ip   : String,
		// 			time : Date
		// 		}
		// 	}
		// },
		// {
		// 	emitIndexErrors : true,
		// 	versionKey      : false,
		// 	// minimize : false
		// })

		// this.User_authentication = mongoose.model('User_authentication', User_authentication_schema)
		// Promise.promisifyAll(this.User_authentication)
	}

	async create_user(user)
	{
		// const result = await new this.User_authentication(user).saveAsync()
		// return result[0]._id.toString()

		const result = await this.user_authentications.insertAsync(user)
		return result.ops[0]._id.toString()
	}

	async find_user_by_id(id)
	{
		// const user = await this.User_authentication.findByIdAsync(id)
		// return mongodb_to_object(user)

		const result = await this.user_authentications.findOneAsync({ _id: ObjectId(id) })
		return mongodb_to_object(result)
	}

	async find_user_by_email(email)
	{
		// const user = await this.User_authentication.findOneAsync({ email })
		// return mongodb_to_object(user)

		const result = await this.user_authentications.findOneAsync({ email })
		return mongodb_to_object(result)
	}

	// update_user(user)
	// {
	// 	return new this.User_authentication(user).saveAsync()
	// }

	async find_token_by_id(token_id, user_id)
	{
		const user = await this.user_authentications.findOneAsync
		({
			_id: ObjectId(user_id),
			[`authentication_tokens.${token_id}`]: { $exists: true }
		})

		if (!user)
		{
			return
		}

		return user.authentication_tokens[token_id]
	}

	revoke_token(token_id, user_id)
	{
		return this.user_authentications.updateOneAsync
		({
			_id: ObjectId(user_id)
		},
		{
			$unset:
			{
				[`authentication_tokens.${token_id}`]: ''
			}
		})
	}

	async add_authentication_token(user, authentication_token_id, ip)
	{
		const now = new Date()

		return this.user_authentications.updateOneAsync
		({
			_id: ObjectId(user.id)
		},
		{
			$set:
			{
				// redundant field for faster latest activity time querying
				latest_activity_time: now,

				[`authentication_tokens.${authentication_token_id}`]: { ip, time: now }
			}
		})
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
			await this.user_authentications.updateOneAsync
			({
				_id: ObjectId(user.id)
			},
			{
				$set:
				{
					// redundant field for faster latest activity time querying
					latest_activity_time: now,

					[`authentication_tokens.${authentication_token_id}`]: { ip, time: now }
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

export const online_status_store = configuration.redis ? new Redis_online_status_store() : new Memory_online_status_store()

export function connect()
{
	return Promise.all
	([
		store.connect(),
		online_status_store.connect()
	])
}