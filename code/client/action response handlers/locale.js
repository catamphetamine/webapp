const initial_state =
{
	messages : {},
	locales  : [],
	locale   : undefined
}

const handlers =
{
	'locale set': (state, action) =>
	{
		const new_state = 
		{
			...state,
			locale  : action.locale
		}

		return new_state
	},

	'locale data loaded': (state, action) =>
	{
		const new_state = 
		{
			...state,
			locales  : action.data.locales,
			locale   : action.data.locales[0],
			messages : action.data.messages
		}

		return new_state
	}
}

// applies a handler based on the action type
// (is copy & paste'd for all action response handlers)
export default function(state = initial_state, action = {})
{
	const handler = handlers[action.type]

	if (!handler)
	{
		return state
	}

	return handler(state, action)
}