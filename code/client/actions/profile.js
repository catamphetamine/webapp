export function update_user(data)
{
	const action =
	{
		promise : http => http.patch(`/users`, data),
		event   : 'update user'
	}

	return action
}