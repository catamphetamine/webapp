// https://github.com/59naga/babel-plugin-transform-bluebird/pull/2
import Promise from 'bluebird'

import redis from 'redis'
Promise.promisifyAll(redis)

// if Redis is installed and configured, use it
export default class Redis_online_status_store
{
	static prefix = 'user:access_time:'
	static ttl = 10 * 60 // 10 minutes

	ready()
	{
		return this.connecting || (this.connecting = this.connect())
	}

	async connect()
	{
		// Redis caches commands until connection is established
		this.client = redis.createClient
		({
			host      : configuration.redis.host,
			port      : configuration.redis.port,
			auth_pass : configuration.redis.password
		})
	}

	// Returns the user's latest activity date
	get(user_id)
	{
		return this.client
			.getAsync(`${Redis_online_status_store.prefix}${user_id}`)
			.then(result => result ? new Date(result) : null)
	}

	// Stores latest access `time` for [authentication token, IP address] pair for this user.
	// `time` is a number (timestamp).
	// Returns the previously stored `time`.
	async get_and_set(user_id, access_token_id, ip, time)
	{
		// Set user's latest activity time
		await this.client.multi()
			.set(`${Redis_online_status_store.prefix}${user_id}`, time)
			.expire(`${Redis_online_status_store.prefix}${user_id}`, Redis_online_status_store.ttl)
			.execAsync()

		// Get and set this access token and IP address latest activity time
		const token_ip_latest_activity_time = await this.client.multi()
			.getset(`${Redis_online_status_store.prefix}${user_id}:${access_token_id}:${ip}`, time)
			.expire(`${Redis_online_status_store.prefix}${user_id}:${access_token_id}:${ip}`, Redis_online_status_store.ttl)
			.execAsync()

		// Return this access token and IP address latest activity time
		if (token_ip_latest_activity_time[0])
		{
			// Convert from Redis string to Javascript timestamp
			return parseInt(token_ip_latest_activity_time[0])
		}
	}
}