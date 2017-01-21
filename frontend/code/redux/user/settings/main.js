import { action, createHandler, stateConnector } from 'react-isomorphic-render'
import settings from '../../../react-isomorphic-render-async'

const handler = createHandler(settings)

export const get_user = action
({
	namespace : 'user settings',
	event     : 'get user',
	action    : http => http.get('/users/current'),
	result    : 'user'
},
handler)

export const revoke_authentication_token = action
({
	namespace : 'user settings',
	event     : 'revoke authentication token',
	action    : (token_id, http) => http.post(`/authentication/token/${token_id}/revoke`)
},
handler)

export const change_email = action
({
	namespace : 'user settings',
	event     : 'change email',
	action    : async (email, password, http) =>
	{
		await http.patch(`/users/email`, { email, password })
		return email
	},
	result    : (state, result) =>
	({
		...state,
		user:
		{
			...state.user,
			email : result
		}
	})
},
handler)

export const change_alias = action
({
	namespace : 'user settings',
	event     : 'change alias',
	action    : async (alias, http) =>
	{
		await http.patch(`/users/alias`, { alias })
		return alias
	},
	result    : (state, result) =>
	({
		...state,
		user:
		{
			...state.user,
			alias : result
		}
	})
},
handler)

export const check_password = action
({
	namespace : 'user settings',
	event     : 'check password',
	action    : (password, http) => http.get(`/authentication/password/check`, { password })
},
handler)

export const reset_check_password_error = () =>
({
	type : 'user settings: check password: reset error'
})

export const get_user_authentication_tokens = action
({
	namespace : 'user settings',
	event     : 'get user authentication tokens',
	action    : async (http) =>
	{
		const tokens = await http.get(`/authentication/tokens`)

		// Sort token history (most recently updated first)
		for (let token of tokens)
		{
			token.history.sort((a, b) => b.updated_at.getTime() - a.updated_at.getTime())
		}

		return tokens
	},
	result : 'authentication_tokens'
},
handler)

// A little helper for Redux `@connect()`
export const connector = stateConnector(handler)

// This is the Redux reducer which now
// handles the asynchronous actions defined above.
export default handler.reducer()