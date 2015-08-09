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

export default function(state = initial_state, action = {})
{
	const handler = handlers[action.type]

	if (!handler)
	{
		return state
	}

	return handler(state, action)
}