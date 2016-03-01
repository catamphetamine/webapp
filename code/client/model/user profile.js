const initial_state =
{
}

const handlers =
{
	'fetching user': (result, state) =>
	{
		const new_state = 
		{
			...state
		}

		return new_state
	},

	'user fetched': (result, state) =>
	{
		const new_state = 
		{
			...state,
			user    : result
		}

		return new_state
	},

	'failed to fetch user': (error, state) =>
	{
		const new_state = 
		{
			...state,
			error   : error
		}

		return new_state
	},

	'fetching users latest activity time': (result, state) =>
	{
		const new_state = 
		{
			...state
		}

		return new_state
	},

	'users latest activity time fetched': (result, state) =>
	{
		const new_state = 
		{
			...state,
			latest_activity_time : new Date(result.time)
		}

		return new_state
	},

	'failed to fetch users latest activity time': (error, state) =>
	{
		const new_state = 
		{
			...state,
			latest_activity_time_error : error
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