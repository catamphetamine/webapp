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
	type  : 'user profile: update user info: error',
	error : null
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

export const reset_upload_user_picture_error = () =>
({
	type  : 'user profile: upload user picture: error',
	error : null
})

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

// `upload_user_picture_pending` will be set to `false`
// when the image is prefetched
// to avoid a flash of a not yet loaded image.
handler.handle('user profile: upload user picture: done', (state, result) => state)

// `set_uploaded_user_picture` is called after the uploaded image is prefetched.
// Prefetching is done to avoid a flash of a not yet loaded image.
export const set_uploaded_user_picture = action
({
	namespace : 'user profile',
	event     : 'reset uploaded user picture',
	payload   : picture => ({ picture }),
	result    : (state, { picture }) =>
	({
		...state,
		upload_user_picture_pending : picture ? false : state.upload_user_picture_pending,
		uploaded_picture            : picture
	})
},
handler)

handler.add_state_properties
(
	'uploaded_picture'
)

export const set_upload_user_picture_other_error = action
({
	namespace : 'user profile',
	event     : 'upload user picture: other error',
	result    : 'upload_user_picture_other_error'
},
handler)

// A little helper for Redux `@connect()`
export const connector = stateConnector(handler)

// This is the Redux reducer which now
// handles the asynchronous actions defined above.
export default handler.reducer()