import { Preload_started, Preload_finished, Preload_failed } from 'react-isomorphic-render/redux'

const initial_state = {}

const handlers =
{
	[Preload_started]: (result, state) =>
	({
		...state,
		pending : true,
		error   : false
	}),

	[Preload_finished]: (result, state) =>
	({
		...state,
		pending : false
	}),

	[Preload_failed]: (result, state) =>
	({
		...state,
		pending : false,
		error   : true
	})
}

// applies a handler based on the action type
// (is copy & paste'd for all action response handlers)
export default function(state = initial_state, action_data = {})
{
	return (handlers[action_data.type] || ((result, state) => state))(action_data.result || action_data.error || action_data, state)
}