import { action, create_handler, state_connector, reset_error } from 'react-isomorphic-render'
import settings from '../../../react-isomorphic-render-async'

const handler = create_handler(settings)

export const check_current_password = action
({
	namespace : 'user settings: change password',
	event     : 'check current password',
	action    : (password, http) => http.get(`/authentication/password/check`, { password })
},
handler)

export const reset_check_current_password_error = reset_error
({
	namespace : 'user settings: change password',
	event     : 'check current password'
},
handler)

export const change_password = action
({
	namespace : 'user settings: change password',
	event     : 'change password',
	action    : (data, http) => http.patch(`/authentication/password`, data)
},
handler)

export const reset_change_password_error = reset_error
({
	namespace : 'user settings: change password',
	event     : 'change password'
},
handler)

// A little helper for Redux `@connect()`
export const connector = state_connector(handler)

// This is the Redux reducer which now
// handles the asynchronous actions defined above.
export default handler.reducer()