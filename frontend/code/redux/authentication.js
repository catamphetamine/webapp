import { action, reset_error, create_handler, state_connector } from 'react-isomorphic-render'
import settings from '../react-isomorphic-render-async'

const handler = create_handler(settings)

export const get_self = action
({
	namespace : 'authentication',
	event     : 'get user',
	action    : async (http) =>
	{
		const user = await http.get('/users', { poster: true })

		if (!user)
		{
			const error = new Error('Unauthenticated')
			error.status = 401
			throw error
		}

		return user
	},
	result    : 'user'
},
handler)

export const sign_in_request = action
({
	namespace : 'user',
	event     : 'sign in request',
	action    : (credentials, http) => http.post(`/users/sign-in/request`, credentials),
	result    : 'authentication'
},
handler)

export const reset_sign_in_request_error = reset_error
({
	namespace : 'user',
	event     : 'sign in request'
},
handler)

export const sign_out = action
({
	namespace : 'user',
	event     : 'sign out',
	action    : (http) => http.post(`/users/sign-out`)
	// Not updating user data in Redux state
	// to prevent a sense of "lagging"
	// (the page will be refreshed anyway)
	// result : (state, result) => ({ ...state, user: undefined })
},
handler)

export const authenticate = action
({
	namespace : 'user',
	event     : 'authenticate',
	action    : (data, http) => http.post(`/authentication`, data),
	result    : (state, result) =>
	{
		if (!result)
		{
			const new_state =
			{
				...state,
				authentication:
				{
					...state.authentication,
					pending: []
				}
			}
			return new_state
		}

		const new_state =
		{
			...state,
			authentication:
			{
				...state.authentication,
				pending: result
			}
		}
		return new_state
	}
},
handler)

export const reset_authenticate_error = reset_error
({
	namespace : 'user',
	event     : 'authenticate'
},
handler)

export const sign_in = action
({
	namespace : 'user',
	event     : 'sign in',
	action    : (multifactor_authentication_id, http) =>
	{
		return http.post(`/users/sign-in`, { multifactor_authentication_id })
	}
},
handler)

export const reset_sign_in_error = reset_error
({
	namespace : 'user',
	event     : 'sign in'
},
handler)

export const register = action
({
	namespace : 'user',
	event     : 'register',
	action    : (info, http) => http.post(`/users/register`, info),
	result    : 'authentication'
},
handler)

export const reset_register_error = reset_error
({
	namespace : 'user',
	event     : 'register'
},
handler)

// Change email authentication
handler.handle('user settings: change email request: done', (state, result) =>
({
	...state,
	authentication: result
}))

// Updates user picture in the user bar when it is changed on the profile page
handler.handle('poster: update poster picture: done', (state, result) =>
({
	...state,
	user:
	{
		...state.user,
		poster:
		{
			...state.user.poster,
			picture: result
		}
	}
}))

// Updates alias in the profile link in the user bar
// when it is changed on the settings page
handler.handle('user settings: change alias: done', (state, result) =>
({
	...state,
	user:
	{
		...state.user,
		alias: result
	}
}))

// Updates user name in the user bar when it is changed on the profile page
handler.handle('poster: update poster: done', (state, result) =>
({
	...state,
	user:
	{
		...state.user,
		poster: result
	}
}))

// handler.addStateProperties('user')

// A little helper for Redux `@connect()`
export const connector = state_connector(handler)

// This is the Redux reducer which now
// handles the asynchronous actions defined above.
export default handler.reducer()