export function get()
{
	const action =
	{
		promise: http => http.get('/log'),
		events: ['retrieving log', 'log retrieved', 'log retrieval failed']
	}

	return action
}