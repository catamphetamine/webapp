import http from '../libraries/http'

export function get()
{
	const action =
	{
		promise: api =>
		{
			return api.get('/example/users').then(ids =>
			{
				return Promise.map(ids, id =>
				{
					return api.get(`/example/users/${id}`)
				})
			})
		},
		types: ['retrieving users', 'users retrieved', 'users retrieval failed']
	}

	return action
}

export function add(info)
{
	// maybe add validation here

	const action =
	{
		promise: api => api.post(`/example/users`, info),
		types: ['adding user', 'user added', 'adding user failed']
	}

	return action
}

export function remove(id)
{
	const action =
	{
		promise: api => api.delete(`/example/users/${id}`),
		types: ['deleting user', 'user deleted', 'deleting user failed']
	}

	return action
}

export function rename()
{
	const action =
	{
		promise: api => api.patch(`/example/users/${id}`),
		types: ['renaming user', 'user renamed', 'renaming user failed']
	}

	return action
}

export function dismiss_adding_error()
{
	return { type: 'adding error dismissed' }
}

export function upload_picture(user_id, data)
{
	const action =
	{
		promise: api => 
		{
			return http.post(`/upload_image`, data).then(result =>
			{
				return api.post(`/example/users/${user_id}/picture`, { file_name: result.file_name })
				.then(() =>
				{
					return { user_id: user_id, picture: result.file_name }
				})
			})
		},
		types: ['uploading user picture', 'user picture uploaded', 'uploading user picture failed']
	}

	return action
}

export function dismiss_uploading_picture_error()
{
	return { type: 'uploading user picture error dismissed' }
}