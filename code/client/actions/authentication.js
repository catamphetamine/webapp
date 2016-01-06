export function authenticate()
{
	const action =
	{
		promise: api => api.call('auth.auth'),
		events: ['authenticating', 'authenticated', 'authentication failed']
	}

	return action
}

export function sign_in(username, password)
{
	const action =
	{
		promise: api => api.call('auth.login', { username: username, password: password }),
		events: ['signing in', 'signed in', 'sign in failed']
	}

	return action
}

export function sign_out()
{
	const action =
	{
		promise: api => api.call('auth.logout'),
		events: ['signing out', 'signed out', 'sign out failed']
	}

	return action
}