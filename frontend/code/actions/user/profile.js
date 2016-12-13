export const update_user = (data) =>
({
	promise : http => http.patch(`/users`, data),
	event   : 'user profile: update user info'
})

export const update_user_reset_error = () =>
({
	type : 'user profile: update user info: reset error'
})

export const get_user = (user_id) =>
({
	promise : http => http.get(`/users/${user_id}`),
	event   : 'user profile: get user'
})

export const get_users_latest_activity_time = (user_id) =>
({
	promise : http => http.get(`/users/was-online-at/${user_id}`, { bot: true }),
	event   : 'user profile: get latest activity time'
})

export const upload_user_picture = (file) =>
({
	promise: async (http) =>
	{
		return http.post(`/images/upload`, { type: 'user_picture', image: file })
	},
	event: 'user profile: upload user picture'
})

export const update_user_picture = (picture) =>
({
	promise: async http => http.post(`/users/picture`, picture),
	event: 'user: update user picture'
})