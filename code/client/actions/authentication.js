export function sign_in(info)
{
	const action =
	{
		promise: http => http.post(`/authentication/sign_in`, info),
		events: ['signing user in', 'user signed in', 'user sign in failed']
	}

	return action
}

export function sign_out()
{
	const action =
	{
		promise: http => http.post(`/authentication/sign_out`),
		events: ['siging user out', 'user signed out', 'user sign out failed']
	}

	return action
}

export function authenticate()
{
	const action =
	{
		promise: http => http.post(`/authentication/authenticate`),
		events: ['authenticating user', 'user authenticated', 'user authentication failed']
	}

	return action
}

export function register(info)
{
	const action =
	{
		promise: http => http.post(`/authentication/register`, info),
		events: ['registering user', 'user registered', 'user registration failed']
	}

	return action
}