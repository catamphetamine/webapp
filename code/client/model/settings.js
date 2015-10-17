const initial_state =
{
	loaded: false
}

const handlers =
{
	'retrieving settings': (state, action) =>
	{
		const new_state = 
		{
			...state,
			loading : true
		}

		return new_state
	},

	'settings retrieved': (state, action) =>
	{
		const new_state = 
		{
			...state,
			loading : false,
			loaded  : true,
			data    : action.result
		}

		return new_state
	},

	'settings retrieval failed': (state, action) =>
	{
		const new_state = 
		{
			...state,
			loading : false,
			loaded  : true,
			error   : action.error
		}

		return new_state
	}
}

// applies a handler based on the action type
// (is copy & paste'd for all action response handlers)
export default function(state = initial_state, action = {})
{
	return (handlers[action.type] || (state => state))(state, action)
}