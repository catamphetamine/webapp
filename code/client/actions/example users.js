export function get()
{
	const action =
	{
		promise: http =>
		{
			return http.get('/api/example/users').then(ids =>
			{
				return Promise.map(ids, id => http.get(`/api/example/users/${id}`))
			})
		},
		events: ['retrieving users', 'users retrieved', 'users retrieval failed']
	}

	return action
}

export function add(info)
{
	// maybe add validation here

	const action =
	{
		promise: http => http.post(`/api/example/users`, info),
		events: ['adding user', 'user added', 'adding user failed']
	}

	return action
}

export function remove(id)
{
	const action =
	{
		promise: http => http.delete(`/api/example/users/${id}`),
		events: ['deleting user', 'user deleted', 'deleting user failed']
	}

	return action
}

export function rename()
{
	const action =
	{
		promise: http => http.patch(`/api/example/users/${id}`),
		events: ['renaming user', 'user renamed', 'renaming user failed']
	}

	return action
}

export function upload_picture(user_id, file, old_picture)
{
	const data = new FormData()

	data.append('type', 'user_picture')
	data.append('image', file)

	const action =
	{
		promise: async (http) => 
		{
			const picture = await http.post(`/images/upload`, data)
			await http.post(`/api/example/users/${user_id}/picture`, picture)
			
			if (old_picture)
			{
				await http.post(`/images/api/delete`, { id: old_picture.id })
			}
			
			return { user_id, picture }
		},
		events: ['uploading user picture', 'user picture uploaded', 'uploading user picture failed']
	}

	return action
}