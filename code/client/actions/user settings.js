export function get_user(user_id)
{
	const action =
	{
		promise : http => http.get(`/users/${user_id}`),
		event   : 'user settings: get user'
	}

	return action
}

export function revoke_authentication_token(token_id)
{
  const action =
  {
    promise : http => http.post(`/authentication/revoke-token`, { id: token_id }),
    event   : 'user settings: revoke authentication token'
  }

  return action
}

export function save_settings(settings)
{
  const action =
  {
    promise : http => http.post(`/user/settings`, settings),
    event   : 'user settings: revoke authentication token'
  }

  return action
}