import { action, createHandler, stateConnector } from 'react-isomorphic-render'
import settings from '../../../react-isomorphic-render-async'

const handler = createHandler(settings)

export const check_current_password = action
({
	namespace: 'user settings: change password',
	event: 'check current password',
	action: (password, http) => http.get(`/authentication/password/check`, { password })
},
handler)

export const reset_check_current_password_error = () =>
({
	type : 'user settings: change password: check current password: reset error'
})

export const change_password = action
({
	namespace: 'user settings: change password',
	event: 'change password',
	action: (data, http) => http.patch(`/authentication/password`, data)
},
handler)

export const reset_change_password_error = () =>
({
	type : 'user settings: change password: change password: reset error'
})

// A little helper for Redux `@connect()`
export const connector = stateConnector(handler)

// This is the Redux reducer which now
// handles the asynchronous actions defined above.
export default handler.reducer()