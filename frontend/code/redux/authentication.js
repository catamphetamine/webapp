import { action, reset_error, create_handler, state_connector } from 'react-isomorphic-render'
import settings from '../react-isomorphic-render-async'

const handler = create_handler(settings)

export const sign_in = action
({
	namespace : 'user',
	event     : 'sign in',
	action    : (credentials, http) => http.post(`/users/sign-in`, credentials),
	result    : 'authentication'
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
	promise   : (data, http) => http.post(`/authentication`, data),
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

export const sign_in_authenticated = action
({
	namespace : 'user',
	event     : 'sign in authenticated',
	promise   : (id, http) => http.post(`/users/sign-in-authenticated`, { id })
},
handler)

export const reset_sign_in_authenticated_error = reset_error
({
	namespace : 'user',
	event     : 'sign in authenticated'
},
handler)

export const register = action
({
	namespace : 'user',
	event     : 'register',
	promise   : (info, http) => http.post(`/users/register`, info),
	result    : 'authentication'
},
handler)

export const reset_sign_in_error = reset_error
({
	namespace : 'user',
	event     : 'sign in'
},
handler)

export const reset_authenticate_error = reset_error
({
	namespace : 'user',
	event     : 'authenticate'
},
handler)

export const reset_register_error = reset_error
({
	namespace : 'user',
	event     : 'register'
},
handler)

// Updates user picture in the user bar when it is changed on the profile page
handler.handle('user: update user picture: done', (state, result) =>
({
	...state,
	user:
	{
		...state.user,
		picture: result.id,
		picture_sizes: result.sizes
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
handler.handle('user profile: update user info: done', (state, result) =>
({
	...state,
	user:
	{
		...state.user,
		name : result.name
	}
}))

handler.addStateProperties('user')

// A little helper for Redux `@connect()`
export const connector = state_connector(handler)

// This is the Redux reducer which now
// handles the asynchronous actions defined above.
export default handler.reducer()