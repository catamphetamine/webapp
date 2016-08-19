const initial_state = {}

const handlers =
{
	'user settings: change password: check current password pending': (result, state) =>
	{
		const new_state = 
		{
			...state,
			checking_current_password : true,
			check_current_password_error : undefined
		}

		return new_state
	},

	'user settings: change password: check current password done': (result, state) =>
	{
		const new_state = 
		{
			...state,
			checking_current_password : false,
			user : result
		}

		return new_state
	},

	'user settings: change password: check current password failed': (error, state) =>
	{
		const new_state = 
		{
			...state,
			checking_current_password : false,
			check_current_password_error : error
		}

		return new_state
	},

	'user settings: change password: check current password reset error': (result, state) =>
	{
		const new_state = 
		{
			...state,
			check_current_password_error : undefined
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