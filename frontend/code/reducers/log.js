import { handle } from '../redux tools'

const initial_state = {}

const handlers = {}

handle(handlers, 'log', 'fetch', 'data')

// applies a handler based on the action type
// (is copy & paste'd for all action response handlers)
export default function(state = initial_state, action_data = {})
{
	return (handlers[action_data.type] || ((result, state) => state))(action_data.result || action_data.error || action_data, state)
}