export function check_current_password(password)
{
	const action =
	{
		promise : http => http.post(`/authentication/check-password`, { password }),
		event   : 'user settings: change password: check current password'
	}

	return action
}

export function reset_check_current_password_error()
{
	const action =
	{
		type: 'user settings: change password: check current password reset error'
	}

	return action
}