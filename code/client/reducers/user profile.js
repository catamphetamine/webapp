const initial_state =
{
}

const handlers =
{
	'fetch user pending': (result, state) =>
	{
		const new_state = 
		{
			...state,
			error : undefined
		}

		return new_state
	},

	'fetch user done': (result, state) =>
	{
		const new_state = 
		{
			...state,
			user    : result
		}

		return new_state
	},

	'fetch user failed': (error, state) =>
	{
		const new_state = 
		{
			...state,
			error   : error
		}

		return new_state
	},

	'fetch users latest activity time pending': (result, state) =>
	{
		const new_state = 
		{
			...state,
			latest_activity_time_error : undefined
		}

		return new_state
	},

	'fetch users latest activity time done': (result, state) =>
	{
		const new_state = 
		{
			...state,
			latest_activity_time : new Date(result.time)
		}

		return new_state
	},

	'fetch users latest activity time failed': (error, state) =>
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