import { action, createHandler, stateConnector } from 'react-isomorphic-render'
import settings from '../../react-isomorphic-render-async'

const handler = createHandler(settings)

export const update_user = action
({
	namespace : 'user profile',
	event     : 'update user info',
	action    : (data, http) => http.patch(`/users`, data),
	result    : 'user'
},
handler)

export const update_user_reset_error = () =>
({
	type : 'user profile: update user info: reset error'
})

export const get_user = action
({
	namespace : 'user profile',
	event     : 'get user',
	action    : (user_id, http) => http.get(`/users/${user_id}`),
	result    : 'user'
},
handler)

export const get_users_latest_activity_time = action
({
	namespace : 'user profile',
	event     : 'get latest activity time',
	action    : (user_id, http) => http.get(`/users/was-online-at/${user_id}`, { bot: true }),
	result    : 'latest_activity_time'
},
handler)

export const upload_user_picture = action
({
	namespace : 'user profile',
	event     : 'upload user picture',
	action    : async (file, http) =>
	{
		return http.post(`/images/upload`, { type: 'user_picture', image: file })
	}
},
handler)

export const update_user_picture = action
({
	namespace : 'user',
	event     : 'update user picture',
	action    : (picture, http) => http.post(`/users/picture`, picture),
	result    : (state, result) =>
	({
		...state,
		user:
		{
			...state.user,
			picture : result
		}
	})
},
handler)

handler.addStateProperties
(
	'uploaded_picture',
	'uploaded_user_picture_is_too_big_error',
	'unsupported_uploaded_user_picture_file_error'
)

// `upload_user_picture_pending` will be set to `false`
// when the image is prefetched
// to avoid a flash of a not yet loaded image.
handler.handle('user profile: upload user picture: done', (state, result) => state)

// Prefetching is done to avoid a flash of a not yet loaded image
handler.handle('user profile: upload user picture: prefetch: done', (state, result) =>
({
	...state,
	upload_user_picture_pending : false,
	uploaded_picture            : result
}))

handler.handle('user profile: upload user picture: prefetch: error', (state, error) =>
({
	...state,
	upload_user_picture_pending : false,
	upload_user_picture_error   : { message: 'Prefetch failed' },
}))

handler.handle('user profile: reset uploaded user picture', (state, result) =>
({
	...state,
	uploaded_picture : undefined
}))

handler.handle('user profile: upload user picture: error: too big', (state, result) =>
({
	...state,
	uploaded_user_picture_is_too_big_error : true
}))

handler.handle('user profile: upload user picture: error: too big: reset', (state, result) =>
({
	...state,
	uploaded_user_picture_is_too_big_error : undefined
}))

handler.handle('user profile: upload user picture: error: unsupported file', (state, result) =>
({
	...state,
	unsupported_uploaded_user_picture_file_error : true
}))

handler.handle('user profile: upload user picture: error: unsupported file: reset', (state, result) =>
({
	...state,
	unsupported_uploaded_user_picture_file_error : undefined
}))

// A little helper for Redux `@connect()`
export const connector = stateConnector(handler)

// This is the Redux reducer which now
// handles the asynchronous actions defined above.
export default handler.reducer()