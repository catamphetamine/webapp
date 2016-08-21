import { handle } from '../redux tools'

const initial_state = {}

const handlers =
{
	'user: update user picture: done': (result, state) =>
	({
		...state,
		user:
		{
			...state.user,
			picture: result
		}
	})
}

handle(handlers, 'user', 'sign in', 'user')
handle(handlers, 'user', 'registration')
handle(handlers, 'user', 'sign out', (result, state) => ({ ...state, user: undefined }))

// for this module to work should be added to model/index.js

// applies a handler based on the action type
// (is copy & paste'd for all action response handlers)
export default function(state = initial_state, action_data = {})
{
	return (handlers[action_data.type] || ((result, state) => state))(action_data.result || action_data.error || action_data, state)
}