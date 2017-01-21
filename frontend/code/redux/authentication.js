import { action, createHandler, stateConnector } from 'react-isomorphic-render'
import settings from '../react-isomorphic-render-async'

const handler = createHandler(settings)

export const sign_in = action
({
	namespace : 'user',
	event     : 'sign in',
	promise   : (credentials, http) => http.post(`/users/sign-in`, credentials)
	// Not updating user data in Redux state
	// to prevent a sense of "lagging"
	// (the page will be refreshed anyway)
	// result : 'user'
},
handler)

export const sign_out = action
({
	namespace : 'user',
	event     : 'sign out',
	promise   : (http) => http.post(`/users/sign-out`)
	// Not updating user data in Redux state
	// to prevent a sense of "lagging"
	// (the page will be refreshed anyway)
	// result : (state, result) => ({ ...state, user: undefined })
},
handler)

export const register = action
({
	namespace : 'user',
	event     : 'register',
	promise   : (info, http) => http.post(`/users/register`, info)
},
handler)

export const sign_in_reset_error = () =>
({
	type: 'user: sign in: reset error'
})

export const register_reset_error = () =>
({
	type: 'user: register: reset error'
})

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
export const connector = stateConnector(handler)

// This is the Redux reducer which now
// handles the asynchronous actions defined above.
export default handler.reducer()