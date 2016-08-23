// https://github.com/59naga/babel-plugin-transform-bluebird/pull/2
import Promise from 'bluebird'

import Redis from 'ioredis'

// if Redis is installed and configured, use it
export default class Redis_online_status_store
{
	static ttl = 10 * 60 // 10 minutes

	ready()
	{
		return this.connecting || (this.connecting = this.connect())
	}

	async connect()
	{
		// Redis caches commands until connection is established
		this.redis = new Redis
		({
			host     : configuration.redis.host,
			port     : configuration.redis.port,
			password : configuration.redis.password,

			// Dropping `Buffer` support for `hiredis`
			// https://github.com/luin/ioredis/wiki/Improve-Performance
			dropBufferSupport : true
		})
	}

	// Returns the user's latest activity date
	get(user_id)
	{
		return this.redis
			.get(`user/${user_id}/latest-access-time`)
			.then(result => result ? new Date(parseInt(result)) : undefined)
	}

	// Stores latest access `time` for [authentication token, IP address] pair for this user.
	// `time` is a number (timestamp).
	// Returns the previously stored `time`.
	async get_and_set(user_id, access_token_id, ip, time)
	{
		// Set user's latest activity time
		await this.redis.multi()
			.set   (`user/${user_id}/latest-access-time`, time)
			.expire(`user/${user_id}/latest-access-time`, Redis_online_status_store.ttl)
			.exec()

		// Get and set this access token and IP address latest activity time
		const update_token_latest_access_time = await this.redis.multi()
			.getset(`token/${access_token_id}/ip/${ip}/latest-access-time`, time)
			.expire(`token/${access_token_id}/ip/${ip}/latest-access-time`, Redis_online_status_store.ttl)
			.exec()

		// Get the first command result from the transaction result
		const token_latest_access_time = update_token_latest_access_time[0][1]

		// Return this access token and IP address latest activity time
		if (token_latest_access_time)
		{
			// Convert from Redis string to Javascript timestamp
			return parseInt(token_latest_access_time)
		}
	}

	// Marks access token as being valid
	// so that the token validity check doesn't query the database
	// (which can be more costly)
	async check_access_token_validity(access_token_id)
	{
		const result = await this.redis.multi()
			.getset(`token/${access_token_id}/valid`, '✔')
			.expire(`token/${access_token_id}/valid`, Redis_online_status_store.ttl)
			.exec()

		// Get the first command result from the transaction result
		const is_valid = result[0][1]

		// Set user's latest activity time
		return is_valid
	}

	// Removes the flag stating that access token is valid
	// so that the token validity check will proceed and query the database
	// (performed upon revoking the token)
	async clear_access_token_validity(access_token_id)
	{
		await this.redis.del(`token/${access_token_id}/valid`)
	}
}