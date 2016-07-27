export function update_user(data)
{
	const action =
	{
		promise : http => http.patch(`/users`, data),
		event   : 'update user'
	}

	return action
}

export function get_user(user_id)
{
	const action =
	{
		promise : http => http.get(`/users/${user_id}`),
		event   : 'user profile: get user'
	}

	return action
}

export function get_users_latest_activity_time(user_id)
{
	const action =
	{
		promise : http => http.get(`/authentication/latest-activity/${user_id}`, { bot: true }),
		event   : "user profile: get user's latest activity time"
	}

	return action
}

export function upload_user_picture(file)
{
	const data = new FormData()

	data.append('type', 'user_picture')
	data.append('image', file)

	const action =
	{
		promise: async http => http.post(`/images/upload`, data),
		event: 'user profile: upload user picture'
	}

	return action
}

export function save_user_picture(picture)
{
	const action =
	{
		promise: async http => http.post(`/users/picture`, picture),
		event: 'save user picture'
	}

	return action
}