export function update_user(data)
{
	const action =
	{
		promise : http => http.patch(`/users`, data),
		event   : 'update user'
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
		promise: async (http) => http.post(`/images/upload`, data),
		event: 'upload user picture'
	}

	return action
}

export function save_user_picture(picture)
{
	const action =
	{
		promise: async (http) => http.post(`/users/picture`, picture),
		event: 'save user picture'
	}

	return action
}