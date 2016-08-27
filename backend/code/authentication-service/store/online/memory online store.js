// if no Redis connection is configured,
// then use in-memory store for demoing
export default class Memory_online_status_store
{
	user_sessions = {}
	
	ready()
	{
		return Promise.resolve()
	}

	// Returns the user's latest activity date
	get_latest_access_time(user_id)
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
	update_latest_access_time(user_id, access_token_id, ip, time)
	{
		const previous_time = this.user_sessions[user_id]
		this.user_sessions[user_id] = time
		return Promise.resolve(previous_time)
	}

	// Marks access token as being valid
	// so that the token validity check doesn't query the database
	// (which can be more costly)
	check_access_token_validity(user_id, access_token_id)
	{
		return Promise.resolve()
	}

	// Caches access token validity
	// so that the token validity check doesn't query the database
	// (which can be more costly)
	set_access_token_validity(user_id, access_token_id, valid)
	{
		return Promise.resolve()
	}
	
	// Removes the flag stating that access token is valid
	// so that the token validity check will proceed and query the database
	// (performed upon revoking the token)
	clear_access_token_validity(user_id, access_token_id)
	{
		return Promise.resolve()
	}

	async get_latest_access_time_persisted_at(authentication_token_id, ip)
	{
	}

	async set_latest_access_time_persisted_at(authentication_token_id, ip, now)
	{
	}
}