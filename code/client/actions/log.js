import http from '../tools/http'

export function get()
{
	const action =
	{
		promise: api => http.get('/log'),
		types: ['retrieving log', 'log retrieved', 'log retrieval failed']
	}

	return action
}