export const generate_block_user_token = (user_id) =>
({
	promise : http => http.post(`/users/block-user-token`, { user_id }),
	event   : 'block user: generate token'
})

export const get_block_user_token = (token_id) =>
({
	promise : http => http.get(`/users/block-user-token/${token_id}`),
	event   : 'block user: get token'
})

export const block_user = (id, token_id, reason) =>
({
	promise : http => http.post(`/users/block`,
	{
		id,
		token : token_id,
		reason
	}),
	event   : 'block user'
})

export const unblock_user = (id, token_id, reason) =>
({
	promise : http => http.post(`/users/unblock`,
	{
		id,
		token : token_id,
		reason
	}),
	event   : 'unblock user'
})