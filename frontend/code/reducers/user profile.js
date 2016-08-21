import { handle } from '../redux tools'

const initial_state = {}

const handlers =
{
	// Prefetching is done to avoid a flash of a not yet loaded image

	'user profile: upload user picture: prefetch: done': (result, state) =>
	({
		...state,
		upload_user_picture_pending : false,
		uploaded_picture            : result
	}),

	'user profile: upload user picture: prefetch: failed': (error, state) =>
	({
		...state,
		upload_user_picture_pending : false
		upload_user_picture_error   : { message: 'Prefetching failed' },
	}),

	'user profile: reset uploaded user picture': (result, state) =>
	({
		...state,
		uploaded_picture : undefined
	}),

	'user profile: upload user picture: error: too big': (result, state) =>
	({
		...state,
		uploaded_user_picture_is_too_big_error : true
	}),

	'user profile: upload user picture: error: too big: reset': (result, state) =>
	({
		...state,
		uploaded_user_picture_is_too_big_error : undefined
	}),

	'user profile: upload user picture: error: unsupported file': (result, state) =>
	({
		...state,
		unsupported_uploaded_user_picture_file_error : true
	}),

	'user profile: upload user picture: error: unsupported file: reset': (result, state) =>
	({
		...state,
		unsupported_uploaded_user_picture_file_error : undefined
	})
}

handle(handlers, 'user profile', 'get user', 'user')
handle(handlers, 'user profile', 'get latest activity time', (result, state) => ({ ...state, latest_activity_time: result.time }))
handle(handlers, 'user profile', 'update user info', 'user')

handle(handlers, 'user', 'update user picture',  (result, state) =>
({
	...state,
	user:
	{
		...state.user,
		picture : result
	}
}))

handle(handlers, 'user profile', 'upload user picture')

if (!handlers['user profile: upload user picture: done'])
{
	throw new Error(`"user profile: upload user picture: done" event reducer not found. Possibly changed Promise event naming scheme.`)
}

// `upload_user_picture_pending` will be set to `false`
// when the image is prefetched
// to avoid a flash of a not yet loaded image.
delete handlers['user profile: upload user picture: done']

// applies a handler based on the action type
// (is copy & paste'd for all action response handlers)
export default function(state = initial_state, action_data = {})
{
	return (handlers[action_data.type] || ((result, state) => state))(action_data.result || action_data.error || action_data, state)
}