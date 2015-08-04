export function get_settings()
{
	const action =
	{
		promise: api => api.call('utility.settings'),
		types: ['retrieving settings', 'settings retrieved', 'settings retrieval failed']
	}

	return action
}