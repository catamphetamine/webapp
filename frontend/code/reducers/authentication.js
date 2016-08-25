import { asynchronous_handler } from '../redux tools'

const initial_state = {}

const handlers = asynchronous_handler
({
	namespace : 'user',
	name      : 'sign in',
	result    : 'user'
},
{
	namespace : 'user',
	name      : 'registration'
},
{
	namespace : 'user',
	name      : 'sign out',
	result    : (result, state) => ({ ...state, user: undefined })
})

// Updates user picture in the user bar when it is changed on the profile page
handlers['user: update user picture: done'] = (result, state) =>
({
	...state,
	user:
	{
		...state.user,
		picture: result
	}
})

// Updates user name in the user bar when it is changed on the profile page
handlers['user profile: update user info: done'] = (result, state) =>
({
	...state,
	user:
	{
		...state.user,
		name : result.name
	}
})

// for this module to work should be added to model/index.js

// applies a handler based on the action type
// (is copy & paste'd for all action response handlers)
export default function(state = initial_state, action_data = {})
{
	return (handlers[action_data.type] || ((result, state) => state))(action_data.result || action_data.error || action_data, state)
}