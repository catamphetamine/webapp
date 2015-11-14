export function get()
{
	const action =
	{
		promise: (api, http) => http.get('/log'),
		types: ['retrieving log', 'log retrieved', 'log retrieval failed']
	}

	return action
}