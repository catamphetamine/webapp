const initial_state =
{
	loaded: false
}

const handlers =
{
	'retrieving users': (result, state) =>
	{
		const new_state = 
		{
			...state,
			loading       : true,
			loading_error : undefined
		}

		return new_state
	},

	'users retrieved': (result, state) =>
	{
		const new_state = 
		{
			...state,
			loading : false,
			loaded  : true,
			stale   : false,
			users   : result
		}

		return new_state
	},

	'users retrieval failed': (error, state) =>
	{
		const new_state = 
		{
			...state,
			loading       : false,
			loading_error : error
		}

		return new_state
	},

	'adding user': (result, state) =>
	{
		const new_state = 
		{
			...state,
			adding : true
		}

		return new_state
	},

	'user added': (result, state) =>
	{
		const new_state = 
		{
			...state,
			adding : false,
			stale  : true
		}

		return new_state
	},

	'adding user failed': (error, state) =>
	{
		const new_state = 
		{
			...state,
			adding       : false,
			adding_error : error
		}

		return new_state
	},

	'adding error dismissed': (result, state) =>
	{
		const new_state = 
		{
			...state,
			adding_error : undefined
		}

		return new_state
	},

	'deleting user': (result, state) =>
	{
		const new_state = 
		{
			...state,
			deleting : true
		}

		return new_state
	},

	'user deleted': (result, state) =>
	{
		const new_state = 
		{
			...state,
			deleting : false,
			stale  : true
		}

		return new_state
	},

	'deleting user failed': (error, state) =>
	{
		const new_state = 
		{
			...state,
			deleting       : false,
			deleting_error : error
		}

		return new_state
	},

	'renaming user': (result, state) =>
	{
		const new_state = 
		{
			...state,
			renaming : true
		}

		return new_state
	},

	'user renamed': (result, state) =>
	{
		const new_state = 
		{
			...state,
			renaming : false,
			stale    : true
		}

		return new_state
	},

	'renaming user failed': (error, state) =>
	{
		const new_state = 
		{
			...state,
			renaming       : false,
			renaming_error : error
		}

		return new_state
	},

	'renaming user failed': (error, state) =>
	{
		const new_state = 
		{
			...state,
			renaming       : false,
			renaming_error : error
		}

		return new_state
	},

	'uploading user picture': (result, state) =>
	{
		const new_state = 
		{
			...state,
			uploading_picture: true
		}

		return new_state
	},

	'user picture uploaded': (result, state) =>
	{
		const new_state = 
		{
			...state,
			uploading_picture: false
		}

		new_state.users.filter(user => user.id === result.user_id)[0].picture = result.picture

		return new_state
	},

	'uploading user picture failed': (error, state) =>
	{
		const new_state = 
		{
			...state,
			uploading_picture       : false,
			uploading_picture_error : error
		}

		return new_state
	},

	'uploading user picture error dismissed': (result, state) =>
	{
		const new_state = 
		{
			...state,
			uploading_picture_error : undefined
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