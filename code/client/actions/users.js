export function get_user(user_id)
{
	const action =
	{
		promise: http => http.get(`/users/${user_id}`),
		events: ['fetching user', 'user fetched', 'failed to fetch user']
	}

	return action
}

export function get_users_latest_activity_time(user_id)
{

	const action =
	{
		promise: http => http.get(`/authentication/latest-activity/${user_id}`),
		events: ['fetching users latest activity time', 'users latest activity time fetched', 'failed to fetch users latest activity time']
	}

	return action
}