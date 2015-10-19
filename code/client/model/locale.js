const initial_state =
{
	messages : {},
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
			locale   : action.data.locale,
			messages : action.data.messages
		}

		return new_state
	},

	'locale set': (state, action) =>
	{
		const new_state = 
		{
			...state,
			locale  : action.locale
		}

		return new_state
	}
}

// for this module to work should be added to model/index.js

// applies a handler based on the action type
// (is copy & paste'd for all action response handlers)
export default function(state = initial_state, action = {})
{
	return (handlers[action.type] || (state => state))(state, action)
}