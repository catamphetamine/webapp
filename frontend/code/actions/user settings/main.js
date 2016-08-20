export const get_user = (user_id) =>
({
	promise : http => http.get(`/users/${user_id}`),
	event   : 'user settings: get user'
})

export const revoke_authentication_token = (token_id) =>
({
	promise : http => http.post(`/authentication/revoke-token`, { id: token_id }),
	event   : 'user settings: revoke authentication token'
})

export const change_email = (email) =>
({
	promise : http => http.patch(`/users/email`, { email }),
	event   : 'user settings: save settings'
})

export const get_user_authentication_tokens = () =>
({
	promise : http => http.get(`/authentication/tokens`),
	event   : 'user settings: get user authentication tokens'
})