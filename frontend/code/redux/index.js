// Redux reducers

import { combineReducers } from 'redux'

import user_settings_main            from './user/settings/main'
import user_settings_change_password from './user/settings/change password'

export { reducer as form }             from 'simpler-redux-form'
export { default as preload }          from './preload'
export { default as snackbar }         from './snackbar'
export { default as authentication }   from './authentication'
export { default as locale }           from './locale'
export { default as poster_profile }   from './poster/profile'
export { default as block_poster }     from './poster/block'
export { default as log }              from './log'
export { default as realtime_service } from './realtime service'

export const user_settings = combineReducers
({
	main            : user_settings_main,
	change_password : user_settings_change_password
})