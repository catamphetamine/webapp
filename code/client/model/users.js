const initial_state =
{
	loaded: false
}

const handlers =
{
	'retrieving users': (state, action) =>
	{
		const new_state = 
		{
			...state,
			loading : true,
			error   : false
		}

		return new_state
	},

	'users retrieved': (state, action) =>
	{
		const new_state = 
		{
			...state,
			loading : false,
			loaded  : true,
			error   : false,
			stale   : false,
			data    : action.result
		}

		return new_state
	},

	'users retrieval failed': (state, action) =>
	{
		const new_state = 
		{
			...state,
			loading : false,
			loaded  : true,
			error   : action.error
		}

		return new_state
	},

	'adding user': (state, action) =>
	{
		const new_state = 
		{
			...state,
			adding : true
		}

		return new_state
	},

	'user added': (state, action) =>
	{
		const new_state = 
		{
			...state,
			adding : false,
			stale  : true
		}

		return new_state
	},

	'adding user failed': (state, action) =>
	{
		const new_state = 
		{
			...state,
			adding : false,
			error  : action.error
		}

		return new_state
	},

	'deleting user': (state, action) =>
	{
		const new_state = 
		{
			...state,
			deleting : true
		}

		return new_state
	},

	'user deleted': (state, action) =>
	{
		const new_state = 
		{
			...state,
			deleting : false,
			stale  : true
		}

		return new_state
	},

	'deleting user failed': (state, action) =>
	{
		const new_state = 
		{
			...state,
			deleting : false,
			error  : action.error
		}

		return new_state
	},

	'renaming user': (state, action) =>
	{
		const new_state = 
		{
			...state,
			renaming : true
		}

		return new_state
	},

	'user renamed': (state, action) =>
	{
		const new_state = 
		{
			...state,
			renaming : false,
			stale  : true
		}

		return new_state
	},

	'renaming user failed': (state, action) =>
	{
		const new_state = 
		{
			...state,
			renaming : false,
			error  : action.error
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