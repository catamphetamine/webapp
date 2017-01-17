import { asynchronous_handler } from '../../redux tools'

const initial_state = {}

const handlers = asynchronous_handler
({
	event  : 'user profile: get user',
	result : 'user'
},
{
	event  : 'user profile: get latest activity time',
	result : 'latest_activity_time'
},
{
	event  : 'user profile: update user info',
	result : 'user'
},
{
	event  : 'user profile: upload user picture'
},
{
	event  : 'user: update user picture',
	result : (result, state) =>
	({
		...state,
		user:
		{
			...state.user,
			picture : result
		}
	})
})

if (!handlers['user profile: upload user picture: done'])
{
	throw new Error(`"user profile: upload user picture: done" event reducer not found. Possibly changed Promise event naming scheme.`)
}

// `upload_user_picture_pending` will be set to `false`
// when the image is prefetched
// to avoid a flash of a not yet loaded image.
delete handlers['user profile: upload user picture: done']

// Prefetching is done to avoid a flash of a not yet loaded image
handlers['user profile: upload user picture: prefetch: done'] = (result, state) =>
({
	...state,
	upload_user_picture_pending : false,
	uploaded_picture            : result
})

handlers['user profile: upload user picture: prefetch: error'] = (error, state) =>
({
	...state,
	upload_user_picture_pending : false,
	upload_user_picture_error   : { message: 'Prefetch failed' },
})

handlers['user profile: reset uploaded user picture'] = (result, state) =>
({
	...state,
	uploaded_picture : undefined
})

handlers['user profile: upload user picture: error: too big'] = (result, state) =>
({
	...state,
	uploaded_user_picture_is_too_big_error : true
})

handlers['user profile: upload user picture: error: too big: reset'] = (result, state) =>
({
	...state,
	uploaded_user_picture_is_too_big_error : undefined
})

handlers['user profile: upload user picture: error: unsupported file'] = (result, state) =>
({
	...state,
	unsupported_uploaded_user_picture_file_error : true
})

handlers['user profile: upload user picture: error: unsupported file: reset'] = (result, state) =>
({
	...state,
	unsupported_uploaded_user_picture_file_error : undefined
})

// applies a handler based on the action type
// (is copy & paste'd for all action response handlers)
export default function(state = initial_state, action_data = {})
{
	return (handlers[action_data.type] || ((result, state) => state))(Object.keys(action_data).has('result') ? action_data.result : action_data.error || action_data, state)
}