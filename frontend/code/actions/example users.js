export const get = () =>
({
	promise : async http =>
	{
		const user_ids = await http.get('/api/example/users')
		return Promise.all(user_ids.map(id => http.get(`/api/example/users/${id}`)))
	},
	events: ['retrieving users', 'users retrieved', 'users retrieval failed']
})

export const add = (info) =>
({
	promise: http => http.post(`/api/example/users`, info),
	events: ['adding user', 'user added', 'adding user failed']
})

export const remove = (id) =>
({
	promise: http => http.delete(`/api/example/users/${id}`),
	events: ['deleting user', 'user deleted', 'deleting user failed']
})

export const rename = () =>
({
	promise: http => http.patch(`/api/example/users/${id}`),
	events: ['renaming user', 'user renamed', 'renaming user failed']
})

export const upload_picture = (user_id, file, old_picture) =>
({
	promise: async (http) => 
	{
		const data = new FormData()

		data.append('type', 'user_picture')
		data.append('image', file)

		const picture = await http.post(`/images/upload`, data)
		await http.post(`/api/example/users/${user_id}/picture`, picture)
		return { user_id, picture }
	},
	events: ['uploading user picture', 'user picture uploaded', 'uploading user picture failed']
})