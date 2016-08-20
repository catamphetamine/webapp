export function check_current_password(password)
{
	const action =
	{
		promise : http => http.get(`/authentication/password/check`, { password }),
		event   : 'user settings: change password: check current password'
	}

	return action
}

export function reset_check_current_password_error()
{
	return { type: 'user settings: change password: check current password reset error' }
}

export function change_password(data)
{
	const action =
	{
		promise : http => http.patch(`/authentication/password`, data),
		event   : 'user settings: change password: change password'
	}

	return action
}

export function reset_change_password_error()
{
	return { type: 'user settings: change password: change password reset error' }
}