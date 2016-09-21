const initial_state =
{
	counter: 0
}

const handlers =
{
	'snack': (result, state) =>
	({
		...state,
		snack : typeof result.snack === 'string' ? { text: result.snack } : result.snack,
		// Since Redux won't rerender
		// if the snack value is the same as the previous one,
		// an explicit change detection variable is introduced.
		counter : state.counter < Number.MAX_VALUE ? state.counter + 1 : 1
	})
}

// applies a handler based on the action type
// (is copy & paste'd for all action response handlers)
export default function(state = initial_state, action_data = {})
{
	return (handlers[action_data.type] || ((result, state) => state))(Object.keys(action_data).has('result') ? action_data.result : action_data.error || action_data, state)
}