const initial_state =
{
	loaded: false
}

const switcher = 
{
	'retrieving settings': (state, action) =>
	{
		const new_state = 
		{
			...state,
			loading: true
		}

		return new_state
	},

	'settings retrieved': (state, action) =>
	{
		const new_state = 
		{
			...state,
			loading: false,
			loaded: true,
			data: action.result
		}

		return new_state
	},

	'settings retrieval failed': (state, action) =>
	{
		const new_state = 
		{
			...state,
			loading: false,
			loaded: true,
			error: action.error
		}

		return new_state
	}
}

export default function info(state = initial_state, action = {})
{
	if (!switcher[action.type])
	{
		return state
	}

	return switcher[action.type](state, action)
}

export function is_loaded(global_state)
{
	return global_state.settings && global_state.settings.loaded
}