export function authenticate(token)
{
	// to do

	const action =
	{
		promise: http => http.post(`/api/authenticate`, token),
		events: ['authenticating user', 'user authenticated', 'user authentication failed']
	}

	return action
}

export function sign_in(info)
{
	const action =
	{
		promise: http => http.post(`/api/sign_in`, info),
		events: ['signing user in', 'user signed in', 'user sign in failed']
	}

	return action
}

export function sign_out(user_id)
{
	// to do

	const action =
	{
		promise: http => http.post(`/api/sign_out`, user_id),
		events: ['siging user out', 'user signed out', 'user sign out failed']
	}

	return action
}

export function register(info)
{
	const action =
	{
		promise: http => http.post(`/api/register`, info),
		events: ['registering user', 'user registered', 'user registration failed']
	}

	return action
}