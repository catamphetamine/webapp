const initial_state =
{
	// loaded: false
}

const handlers =
{
	'registering user': (result, state) =>
	{
		const new_state = 
		{
			...state,
			registering : true
		}

		return new_state
	},

	'user registered': (result, state) =>
	{
		const new_state = 
		{
			...state,
			registering : false,
			// stale  : true
		}

		return new_state
	},

	'user registration failed': (error, state) =>
	{
		const new_state = 
		{
			...state,
			registering        : false,
			registration_error : error
		}

		return new_state
	},

	'signing user in': (result, state) =>
	{
		const new_state = 
		{
			...state,
			signing_in : true
		}

		return new_state
	},

	'user signed in': (result, state) =>
	{
		const new_state = 
		{
			...state,
			signing_in : false,
			user       : result,
			// stale  : true
		}

		return new_state
	},

	'user sign in failed': (error, state) =>
	{
		const new_state = 
		{
			...state,
			signing_in    : false,
			sign_in_error : error
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