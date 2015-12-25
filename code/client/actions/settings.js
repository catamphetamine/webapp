export function get()
{
	const action =
	{
		promise: http => http.get('/api/utility/settings'),
		events: ['retrieving settings', 'settings retrieved', 'settings retrieval failed']
	}

	return action
}