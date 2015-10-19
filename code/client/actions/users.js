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
					return api.get(`/example/user/${id}`)
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
		promise: api => api.post(`/example/user`, info),
		types: ['adding user', 'user added', 'adding user failed']
	}

	return action
}

export function remove(id)
{
	const action =
	{
		promise: api => api.delete(`/example/user/${id}`),
		types: ['deleting user', 'user deleted', 'deleting user failed']
	}

	return action
}

export function rename()
{
	const action =
	{
		promise: api => api.patch(`/example/user/${id}`),
		types: ['renaming user', 'user renamed', 'renaming user failed']
	}

	return action
}