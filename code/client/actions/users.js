export function get_user(user_id)
{
	const action =
	{
		promise : http => http.get(`/users/${user_id}`),
		event   : 'fetch user'
	}

	return action
}

export function get_users_latest_activity_time(user_id)
{

	const action =
	{
		promise : http => http.get(`/authentication/latest-activity/${user_id}`),
		event   : 'fetch users latest activity time'
	}

	return action
}