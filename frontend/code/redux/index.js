// Redux reducers

import { combineReducers } from 'redux'

import user_settings_main            from './user/settings/main'
import user_settings_change_password from './user/settings/change password'

// https://github.com/webpack/webpack/issues/3769#issuecomment-270563837
// export { reducer as form } from 'simpler-redux-form'
import { reducer } from 'simpler-redux-form'
export { reducer as form }

export { default as preload }        from './preload'
export { default as snackbar }       from './snackbar'
export { default as authentication } from './authentication'
export { default as navigator }      from './navigator'
export { default as locale }         from './locale'
export { default as example_users }  from './example users'
export { default as user_profile }   from './user/profile'
export { default as block_user }     from './user/block'
export { default as log }            from './log'

export const user_settings = combineReducers
({
	main            : user_settings_main,
	change_password : user_settings_change_password
})