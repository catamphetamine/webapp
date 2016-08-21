const initial_state =
{
	loaded: false
}

const handlers =
{
	'retrieving users': (result, state) =>
	({
		...state,
		loading       : true,
		loading_error : undefined
	}),

	'users retrieved': (result, state) =>
	({
		...state,
		loading : false,
		loaded  : true,
		users   : result
	}),

	'users retrieval failed': (error, state) =>
	({
		...state,
		loading       : false,
		loading_error : error
	}),

	'adding user': (result, state) =>
	({
		...state,
		adding : true
	}),

	'user added': (result, state) =>
	({
		...state,
		adding : false
	}),

	'adding user failed': (error, state) =>
	({
		...state,
		adding       : false,
		adding_error : error
	}),

	'deleting user': (result, state) =>
	({
		...state,
		deleting : true
	}),

	'user deleted': (result, state) =>
	({
		...state,
		deleting : false
	}),

	'deleting user failed': (error, state) =>
	({
		...state,
		deleting       : false,
		deleting_error : error
	}),

	'renaming user': (result, state) =>
	({
		...state,
		renaming : true
	}),

	'user renamed': (result, state) =>
	({
		...state,
		renaming : false
	}),

	'renaming user failed': (error, state) =>
	({
		...state,
		renaming       : false,
		renaming_error : error
	}),

	'uploading user picture': (result, state) =>
	({
		...state,
		uploading_picture: true
	}),

	'user picture uploaded': (result, state) =>
	{
		const new_state = 
		{
			...state,
			uploading_picture: false
		}

		// Change the `picture` for the specified `user_id`
		new_state.users.filter(user => user.id === result.user_id)[0].picture = result.picture

		return new_state
	},

	'uploading user picture failed': (error, state) =>
	({
		...state,
		uploading_picture       : false,
		uploading_picture_error : error
	})
}

// for this module to work should be added to model/index.js

// applies a handler based on the action type
// (is copy & paste'd for all action response handlers)
export default function(state = initial_state, action_data = {})
{
	return (handlers[action_data.type] || ((result, state) => state))(action_data.result || action_data.error || action_data, state)
}