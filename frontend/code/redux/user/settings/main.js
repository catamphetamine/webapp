import { action, create_handler, state_connector, reset_error } from 'react-isomorphic-render'
import settings from '../../../react-isomorphic-render-async'

const handler = create_handler(settings)

export const get_user_authentication = action
({
	namespace : 'user settings',
	event     : 'get authentication configuration',
	action    : http => http.get('/users/authentication'),
	result    : 'authentication_info'
},
handler)

export const revoke_authentication_token = action
({
	namespace : 'user settings',
	event     : 'revoke authentication token',
	action    : (token_id, http) => http.post(`/users/access-tokens/${token_id}/revoke`)
},
handler)

export const change_email_request = action
({
	namespace : 'user settings',
	event     : 'change email request',
	action    : (email, http) => http.post(`/users/email/request`, { email })
},
handler)

export const reset_change_email_request_error = reset_error
({
	namespace : 'user settings',
	event     : 'change email request'
},
handler)

export const change_email = action
({
	namespace : 'user settings',
	event     : 'change email',
	action    : (multifactor_authentication_id, http) =>
	{
		// The new `email` goes to the Redux state
		return http.patch(`/users/email`, { multifactor_authentication_id })
	}
},
handler)

export const reset_change_email_error = reset_error
({
	namespace : 'user settings',
	event     : 'change email'
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

export const reset_change_alias_error = reset_error
({
	namespace : 'user settings',
	event     : 'change alias'
},
handler)

export const check_password = action
({
	namespace : 'user settings',
	event     : 'check password',
	action    : (password, http) => http.get(`/authentication/password/check`, { password })
},
handler)

export const reset_check_password_error = reset_error
({
	namespace : 'user settings',
	event     : 'check password'
},
handler)

export const set_load_advanced_settings_pending = action
({
	namespace : 'user settings',
	event     : 'load advanced settings: pending',
	result    : 'load_advanced_settings_pending'
},
handler)

export const set_load_advanced_settings_error = action
({
	namespace : 'user settings',
	event     : 'load advanced settings: error',
	result    : 'load_advanced_settings_error'
},
handler)

export const get_user_authentication_tokens = action
({
	namespace : 'user settings',
	event     : 'get user authentication tokens',
	action    : async (http) =>
	{
		const tokens = await http.get(`/users/access-tokens`)

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
export const connector = state_connector(handler)

// This is the Redux reducer which now
// handles the asynchronous actions defined above.
export default handler.reducer()