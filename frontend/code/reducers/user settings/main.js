const initial_state = {}

const handlers =
{
	'user settings: get user pending': (result, state) =>
	{
		const new_state = 
		{
			...state,
			error : undefined
		}

		return new_state
	},

	'user settings: get user done': (result, state) =>
	{
		const new_state = 
		{
			...state,
			user : result
		}

		return new_state
	},

	'user settings: get user failed': (error, state) =>
	{
		const new_state = 
		{
			...state,
			error
		}

		return new_state
	},

	'user settings: load advanced settings pending': (result, state) =>
	{
		const new_state = 
		{
			...state,
			loading_advanced_settings    : true,
			load_advanced_settings_error : undefined
		}

		return new_state
	},

	'user settings: load advanced settings done': (result, state) =>
	{
		const new_state = 
		{
			...state,
			loading_advanced_settings : false
		}

		return new_state
	},

	'user settings: load advanced settings failed': (error, state) =>
	{
		const new_state = 
		{
			...state,
			load_advanced_settings_error : error,
			loading_advanced_settings    : false
		}

		return new_state
	},

	'user settings: get user authentication tokens pending': (result, state) =>
	{
		const new_state = 
		{
			...state,
			get_user_authentication_tokens_error   : undefined,
			get_user_authentication_tokens_pending : true
		}

		return new_state
	},

	'user settings: get user authentication tokens done': (result, state) =>
	{
		const new_state = 
		{
			...state,
			authentication_tokens: result.tokens,
			get_user_authentication_tokens_pending : false
		}

		return new_state
	},

	'user settings: get user authentication tokens failed': (error, state) =>
	{
		const new_state = 
		{
			...state,
			get_user_authentication_tokens_error   : error,
			get_user_authentication_tokens_pending : false
		}

		return new_state
	},

	// 'user settings: revoke authentication token pending': (result, state) =>
	// {
	// 	const new_state = 
	// 	{
	// 		...state,
	// 		revoke_authentication_token_error : undefined
	// 	}
	//
	// 	return new_state
	// },

	// 'user settings: revoke authentication token failed': (error, state) =>
	// {
	// 	const new_state = 
	// 	{
	// 		...state,
	// 		revoke_authentication_token_error: error
	// 	}
	//
	// 	return new_state
	// },
}

// applies a handler based on the action type
// (is copy & paste'd for all action response handlers)
export default function(state = initial_state, action_data = {})
{
	return (handlers[action_data.type] || ((result, state) => state))(action_data.result || action_data.error || action_data, state)
}