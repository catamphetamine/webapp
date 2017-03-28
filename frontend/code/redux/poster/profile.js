import { action, create_handler, state_connector, reset_error } from 'react-isomorphic-render'
import settings from '../../react-isomorphic-render-async'

const handler = create_handler(settings)

export const update_poster = action
({
	namespace : 'poster',
	event     : 'update poster info',
	action    : (id, data, http) => http.patch(`/social/poster/${id}`, data),
	result    : 'poster'
},
handler)

export const reset_update_poster_error = reset_error
({
	namespace : 'poster',
	event     : 'update poster info'
},
handler)

export const get_poster = action
({
	namespace : 'poster',
	event     : 'get poster',
	action    : (id, http) => http.get(`/social/poster/${id}`),
	result    : 'poster'
},
handler)

export const get_users_latest_activity_time = action
({
	namespace : 'user',
	event     : 'get latest activity time',
	action    : (id, http) => http.get(`/users/was-online-at/${id}`, { bot: true }),
	result    : 'latest_activity_time'
},
handler)

export const upload_poster_picture = action
({
	namespace : 'poster',
	event     : 'upload poster picture',
	action    : async (file, http) =>
	{
		return http.post(`/images/upload`, { type: 'poster_picture', image: file })
	}
},
handler)

export const reset_upload_poster_picture_error = reset_error
({
	namespace : 'poster',
	event     : 'upload poster picture'
},
handler)

export const update_poster_picture = action
({
	namespace : 'poster',
	event     : 'update poster picture',
	action    : (id, picture, http) => http.post(`/social/poster/${id}/picture`, { picture }),
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

export const reset_update_poster_picture_error = reset_error
({
	namespace : 'poster',
	event     : 'update poster picture'
},
handler)

// `upload_poster_picture_pending` will be set to `false`
// when the image is prefetched
// to avoid a flash of a not yet loaded image.
handler.handle('poster: upload poster picture: done', (state, result) => state)

// `set_uploaded_poster_picture` is called after the uploaded image is prefetched.
// Prefetching is done to avoid a flash of a not yet loaded image.
export const set_uploaded_poster_picture = action
({
	namespace : 'poster',
	event     : 'reset uploaded poster picture',
	payload   : picture => ({ picture }),
	result    : (state, { picture }) =>
	({
		...state,
		upload_poster_picture_pending : false,
		uploaded_picture              : picture
	})
},
handler)

handler.add_state_properties
(
	'uploaded_picture'
)

export const set_upload_poster_picture_other_error = action
({
	namespace : 'poster',
	event     : 'upload poster picture: other error',
	result    : 'upload_poster_picture_other_error'
},
handler)

// A little helper for Redux `@connect()`
export const connector = state_connector(handler)

// This is the Redux reducer which now
// handles the asynchronous actions defined above.
export default handler.reducer()