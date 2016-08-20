export const update_user = (data) =>
({
	promise : http => http.patch(`/users`, data),
	event   : 'update user'
})

export const get_user = (user_id) =>
({
	promise : http => http.get(`/users/${user_id}`),
	event   : 'user profile: get user'
})

export const get_users_latest_activity_time = (user_id) =>
({
	promise : http => http.get(`/authentication/latest-activity/${user_id}`, { bot: true }),
	event   : "user profile: get user's latest activity time"
})

export const upload_user_picture = (file) =>
({
	promise: async (http) =>
	{
		const data = new FormData()

		data.append('type', 'user_picture')
		data.append('image', file)

		return http.post(`/images/upload`, data)
	},
	event: 'user profile: upload user picture'
})

export const save_user_picture = (picture) =>
({
	promise: async http => http.post(`/users/picture`, picture),
	event: 'save user picture'
})