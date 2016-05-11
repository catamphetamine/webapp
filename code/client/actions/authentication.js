export function sign_in(info)
{
	const action =
	{
		promise : http => http.post(`/authentication/sign-in`, info),
		event   : 'user sign in'
	}

	return action
}

export function sign_out()
{
	const action =
	{
		promise : http => http.post(`/authentication/sign-out`),
		event   : 'user sign out'
	}

	return action
}

// export function authenticate()
// {
// 	const action =
// 	{
// 		promise : http => http.post(`/authentication/authenticate`),
// 		event   : 'user authentication'
// 	}
//
// 	return action
// }

export function register(info)
{
	const action =
	{
		promise : http => http.post(`/authentication/register`, info),
		event   : 'user registration'
	}

	return action
}

export function get_user_authentication_tokens()
{
	const action =
	{
		promise : http => http.get(`/authentication/tokens`,),
		event   : 'get user authentication tokens'
	}

	return action
}