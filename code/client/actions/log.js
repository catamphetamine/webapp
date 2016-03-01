export function get()
{
	const action =
	{
		promise : http => http.get('/log'),
		event   : 'fetch log'
	}

	return action
}