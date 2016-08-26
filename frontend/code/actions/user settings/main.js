export const get_user = (user_id) =>
({
	promise : http => http.get(`/users/${user_id}`),
	event   : 'user settings: get user'
})

export const revoke_authentication_token = (token_id) =>
({
	promise : http => http.post(`/authentication/token/revoke`, { id: token_id }),
	event   : 'user settings: revoke authentication token'
})

export const change_email = (email) =>
({
	promise : http => http.patch(`/users/email`, { email }),
	event   : 'user settings: save settings'
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