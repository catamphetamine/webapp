// https://github.com/59naga/babel-plugin-transform-bluebird/pull/2
import Promise from 'bluebird'

import moment from 'moment'
import uid    from 'uid-safe'
import redis  from 'redis'

import MongoDB from '../common/mongodb'

import { lookup_ip, can_lookup_ip } from '../../../code/geocoding'

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
		await this.collection('user_authentication').update_by_id(user_id, { $set: { email } })
	}

	async update_password(user_id, password)
	{
		await this.collection('user_authentication').update_by_id(user_id, { $set: { password } })
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

		// Add the token to the database
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

		// If there's too much tokens, then remove excessive revoked ones
		await this.remove_excessive_tokens(user.id)

		// Add the token to user data
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

	async remove_excessive_tokens(user_id)
	{
		// Allow max 10 tokens per user
		const user_token_limit = 10

		// Get a list of all authentication tokens for this user
		const tokens = await this.collection('authentication_tokens').query
		({
			user_id : this.ObjectId(user_id)
		},
		{
			sort:
			{
				latest_access: 1
			}
		})

		// Sort tokens in the following order:
		//
		// not revoked tokens used recently,
		// not revoked tokens used a long time ago,
		// tokens revoked recently,
		// tokens revoked a long time ago.
		//
		tokens.sort((a, b) =>
		{
			if (!a.revoked && !b.revoked)
			{
				return b.latest_access - a.latest_access
			}

			if (a.revoked && !b.revoked)
			{
				return 1
			}

			if (!a.revoked && b.revoked)
			{
				return -1
			}

			return b.revoked.getTime() - a.revoked.getTime()
		})

		// If the token limit hasn't been exceeded, then remove no tokens
		if (tokens.length <= user_token_limit)
		{
			return
		}

		// The token limit has been exceeded, so remove excessive tokens
		// (the ones in the end are less relevant, the first ones are most relevant)
		const excessive_tokens = tokens.slice(user_token_limit)

		// Remove excessive tokens one-by-one
		for (let token of excessive_tokens)
		{
			await this.collection('authentication_tokens').remove_by_id(token._id)
		}
	}

	async record_access(user, authentication_token_id, ip)
	{
		const latest_activity_time_refresh_interval = 60 * 1000 // one minute

		const now = Date.now()

		// Update user's online status
		const previous_timestamp = await online_status_store.get_and_set(user.id, authentication_token_id, ip, now)

		// If enough time has passed to update this user's latest activity time,
		// then update it
		if (!previous_timestamp || now - previous_timestamp >= latest_activity_time_refresh_interval)
		{
			const time = round_user_access_time(now)

			// Update user's `latest_activity_time`
			await this.collection('user_authentication').update_by_id(user.id,
			{
				$set:
				{
					// redundant field for faster latest activity time querying
					latest_activity_time: time
				}
			})

			// Create access history entry for the token for this IP
			const access_entry = { ip, time }

			// If there's no access history entry for the token for this IP,
			// then insert it to the history.
			const history_entry_added = await this.collection('authentication_tokens').findAndModifyAsync
			(
				{
					_id          : this.ObjectId(authentication_token_id),
					'history.ip' : { $ne: ip }
				},
				undefined,
				{
					$push:
					{
						history: access_entry
					}
				}
			)

			// The update that will be performed on the token
			let update =
			{
				$set:
				{
					// Redundant field for faster access token sorting
					latest_access: time
				}
			}

			// If there previously was no access history entry for the token for this IP,
			// then also set the place on this history entry.
			if (history_entry_added.value !== null)
			{
				// Gather info about the place of access
				const place = await get_place_for_ip(ip)

				// Log the place info
				if (place && place.city)
				{
					update.$set['history.$.place'] = place
				}
			}
			// Else, if there already was an access history entry for the token for this IP,
			// then just update its `time`.
			else
			{
				update.$set['history.$.time'] = time
			}

			// Perform the update on the token
			await this.collection('authentication_tokens').updateOneAsync
			(
				{
					_id          : this.ObjectId(authentication_token_id),
					'history.ip' : ip
				},
				update
			)
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

	// Returns the user's latest activity date
	get(user_id)
	{
		if (!this.user_sessions[user_id])
		{
			return Promise.resolve()
		}

		return Promise.resolve(new Date(this.user_sessions[user_id]))
	}

	// Stores latest access `time` for [authentication token, IP address] pair for this user.
	// `access_token_id` and `ip` are ignored here, because it's just a demo mode RAM store.
	// `time` is a number (timestamp).
	// Returns the previously stored `time`.
	get_and_set(user_id, access_token_id, ip, time)
	{
		const previous_time = this.user_sessions[user_id]
		this.user_sessions[user_id] = time
		return Promise.resolve(previous_time)
	}
}

// if Redis is installed and configured, use it
class Redis_online_status_store
{
	prefix = 'user:access_time:'
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

	// Returns the user's latest activity date
	get(user_id)
	{
		return this.client
			.getAsync(`${this.prefix}${user_id}`)
			.then(result => result ? new Date(result) : null)
	}

	// Stores latest access `time` for [authentication token, IP address] pair for this user.
	// `time` is a number (timestamp).
	// Returns the previously stored `time`.
	async get_and_set(user_id, access_token_id, ip, time)
	{
		// Convert Javascript timestamp to long Unix timestamp
		time = Math.floor(time / 1000)

		// Set user's latest activity time
		await this.client.multi()
			.set(`${this.prefix}${user_id}`, time)
			.expire(`${this.prefix}${user_id}`, this.ttl)
			.execAsync()

		// Get and set this access token and IP address latest activity time
		const token_ip_latest_activity_time = await this.client.multi()
			.getset(`${this.prefix}${user_id}:${access_token_id}:${ip}`, time)
			.expire(`${this.prefix}${user_id}:${access_token_id}:${ip}`, this.ttl)
			.execAsync()

		// Return this access token and IP address latest activity time
		if (token_ip_latest_activity_time[0])
		{
			// Convert from Unix timestamp back to Javascript timestamp
			return parseInt(token_ip_latest_activity_time[0]) * 1000
		}
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

async function get_place_for_ip(ip)
{
	if (!can_lookup_ip())
	{
		return
	}

	try
	{
		return await lookup_ip(ip)
	}
	catch (error)
	{
		log.error(error)
	}
}