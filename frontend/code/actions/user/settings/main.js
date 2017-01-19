export const get_user = (user_id) =>
({
	promise : http => http.get('/users/current'),
	event   : 'user settings: get user'
})

export const revoke_authentication_token = (token_id) =>
({
	promise : http => http.post(`/authentication/token/${token_id}/revoke`),
	event   : 'user settings: revoke authentication token'
})

export const change_email = (email, password) =>
({
	promise : async http =>
	{
		await http.patch(`/users/email`, { email, password })
		return email
	},
	event   : 'user settings: change email'
})

export const change_alias = (alias) =>
({
	promise : async http =>
	{
		await http.patch(`/users/alias`, { alias })
		return alias
	},
	event   : 'user settings: change alias'
})

export const check_password = (password) =>
({
	promise : http => http.get(`/authentication/password/check`, { password }),
	event   : 'user settings: check password'
})

export const reset_check_password_error = () =>
({
	type : 'user settings: check password: reset error'
})

export const get_user_authentication_tokens = () =>
({
	promise : async http =>
	{
		const tokens = await http.get(`/authentication/tokens`)

		// Sort token history (most recently updated first)
		for (let token of tokens)
		{
			token.history.sort((a, b) => b.updated_at.getTime() - a.updated_at.getTime())
		}

		return tokens
	},
	event   : 'user settings: get user authentication tokens'
})