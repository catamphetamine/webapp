export function get()
{
	const action =
	{
		promise: api => api.get('/utility/settings'),
		types: ['retrieving settings', 'settings retrieved', 'settings retrieval failed']
	}

	return action
}