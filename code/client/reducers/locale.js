const initial_state = {}

const handlers =
{
	'locale': (result, state) =>
	{
		const new_state = 
		{
			...state,
			locale : result.locale
		}

		return new_state
	}
}

// for this module to work should be added to model/index.js

// applies a handler based on the action type
// (is copy & paste'd for all action response handlers)
export default function(state = initial_state, action_data = {})
{
	return (handlers[action_data.type] || ((result, state) => state))(action_data.result || action_data.error || action_data, state)
}