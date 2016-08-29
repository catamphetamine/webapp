import { asynchronous_handler } from '../../redux tools'

const initial_state = {}

const handlers = asynchronous_handler
({
	event  : 'user settings: get user',
	result : 'user'
},
{
	event  : 'user settings: load advanced settings'
},
{
	event  : 'user settings: get user authentication tokens',
	result : 'authentication_tokens'
},
{
	event : 'user settings: check password'
},
{
	event : 'user settings: change email'
})

handlers['user settings: email changed'] = (result, state) =>
({
	...state,
	user:
	{
		...state.user,
		email : result
	}
})

// applies a handler based on the action type
// (is copy & paste'd for all action response handlers)
export default function(state = initial_state, action_data = {})
{
	return (handlers[action_data.type] || ((result, state) => state))(Object.keys(action_data).has('result') ? action_data.result : action_data.error || action_data, state)
}