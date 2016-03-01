const initial_state =
{
	// loaded: false
}

const handlers =
{
	'fetch log pending': (result, state) =>
	{
		const new_state = 
		{
			...state,
			// loading : true
		}

		return new_state
	},

	'fetch log done': (result, state) =>
	{
		const new_state = 
		{
			...state,
			// loading : false,
			// loaded  : true,
			data    : result
		}

		return new_state
	},

	'fetch log failed': (error, state) =>
	{
		const new_state = 
		{
			...state,
			// loading : false,
			error   : error
		}

		return new_state
	}
}

// applies a handler based on the action type
// (is copy & paste'd for all action response handlers)
export default function(state = initial_state, action_data = {})
{
	return (handlers[action_data.type] || ((result, state) => state))(action_data.result || action_data.error || action_data, state)
}