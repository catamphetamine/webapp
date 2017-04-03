import { action, create_handler, state_connector, reset_error } from 'react-isomorphic-render'
import settings from '../../react-isomorphic-render-async'

const handler = create_handler(settings)

export const update_poster = action
({
	namespace : 'poster',
	event     : 'update poster',
	action    : (id, data, http) => http.patch(`/social/poster/${id}`, data),
	result    : 'poster'
},
handler)

export const reset_update_poster_error = reset_error
({
	namespace : 'poster',
	event     : 'update poster'
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

// Poster picture

export const upload_picture = action
({
	namespace : 'poster',
	event     : 'upload picture',
	action    : async (file, type, http) =>
	{
		return http.post(`/images/upload`, { type, image: file })
	}
},
handler)

export const reset_upload_picture_error = reset_error
({
	namespace : 'poster',
	event     : 'upload picture'
},
handler)

// Force `upload_picture_pending`
// to be set to `false` later
// when the image is prefetched
// to avoid a flash of a not yet loaded image.
// This stub handler substitutes the default behaviour.
handler.handle('poster: upload picture: done', (state, result) => state)

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

export const update_poster_background_pattern = action
({
	namespace : 'poster',
	event     : 'update poster background pattern',
	action    : (id, picture, http) => http.post(`/social/poster/${id}/background`, { picture }),
	result    : (state, result) =>
	({
		...state,
		user:
		{
			...state.user,
			background_pattern : result
		}
	})
},
handler)

export const reset_update_poster_background_pattern_error = reset_error
({
	namespace : 'poster',
	event     : 'update poster background pattern'
},
handler)

export const update_poster_banner = action
({
	namespace : 'poster',
	event     : 'update poster banner',
	action    : (id, picture, http) => http.post(`/social/poster/${id}/banner`, { picture }),
	result    : (state, result) =>
	({
		...state,
		poster:
		{
			...state.poster,
			banner : result
		}
	})
},
handler)

export const reset_update_poster_banner_error = reset_error
({
	namespace : 'poster',
	event     : 'update poster banner'
},
handler)

// `set_uploaded_poster_picture` is called after the uploaded image is prefetched.
// Prefetching is done to avoid a flash of a not yet loaded image.
export const set_uploaded_poster_picture = action
({
	namespace : 'poster',
	event     : 'set uploaded poster picture',
	payload   : picture => ({ picture }),
	result    : (state, { picture }) =>
	({
		...state,
		upload_picture_pending : false,
		uploaded_poster_picture       : picture
	})
},
handler)

// `set_uploaded_poster_background_pattern` is called after the uploaded image is prefetched.
// Prefetching is done to avoid a flash of a not yet loaded image.
export const set_uploaded_poster_background_pattern = action
({
	namespace : 'poster',
	event     : 'set uploaded poster background pattern',
	payload   : picture => ({ picture }),
	result    : (state, { picture }) =>
	({
		...state,
		upload_picture_pending      : false,
		uploaded_background_pattern : picture
	})
},
handler)

// `set_uploaded_poster_banner` is called after the uploaded image is prefetched.
// Prefetching is done to avoid a flash of a not yet loaded image.
export const set_uploaded_poster_banner = action
({
	namespace : 'poster',
	event     : 'set uploaded poster banner',
	payload   : picture => ({ picture }),
	result    : (state, { picture }) =>
	({
		...state,
		upload_picture_pending : false,
		uploaded_banner        : picture
	})
},
handler)

handler.add_state_properties
(
	'uploaded_poster_picture',
	'uploaded_background_pattern',
	'uploaded_banner'
)

export const set_upload_picture_error = action
({
	namespace : 'poster',
	event     : 'upload picture: error',
	result    : 'upload_picture_error'
},
handler)

// A little helper for Redux `@connect()`
export const connector = state_connector(handler)

// This is the Redux reducer which now
// handles the asynchronous actions defined above.
export default handler.reducer()