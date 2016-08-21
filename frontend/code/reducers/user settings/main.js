import { asynchronous_handler } from '../../redux tools'

const initial_state = {}

const handlers = asynchronous_handler
({
	namespace : 'user settings',
	name      : 'get user',
	result    : 'user'
},
{
	namespace : 'user settings',
	name      : 'load advanced settings'
},
{
	namespace : 'user settings',
	name      : 'get user authentication tokens',
	result    : 'authentication_tokens'
})

// applies a handler based on the action type
// (is copy & paste'd for all action response handlers)
export default function(state = initial_state, action_data = {})
{
	return (handlers[action_data.type] || ((result, state) => state))(action_data.result || action_data.error || action_data, state)
}