export const get_blocked_user = (token_id) =>
({
	promise : http => http.get(`/users/block-user-token/${token_id}`),
	event   : 'block user: get user'
})

export const block_user = (id, token_id) =>
({
	promise : http => http.post(`/users/block`, { id, token: token_id }),
	event   : 'block user'
})