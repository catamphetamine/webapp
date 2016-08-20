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