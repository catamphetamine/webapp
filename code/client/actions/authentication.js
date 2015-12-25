export function authenticate()
{
	const action =
	{
		promise: api => api.call('auth.auth'),
		events: ['authenticating', 'authenticated', 'authentication failed']
	}

	return action
}

export function login(username, password)
{
	const action =
	{
		promise: api => api.call('auth.login', { username: username, password: password }),
		events: ['logging in', 'logged in', 'login failed']
	}

	return action
}

export function logout()
{
	const action =
	{
		promise: api => api.call('auth.logout'),
		events: ['logging out', 'logged out', 'logout failed']
	}

	return action
}