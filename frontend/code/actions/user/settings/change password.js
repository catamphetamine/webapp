export const check_current_password = (password) =>
({
	promise : http => http.get(`/authentication/password/check`, { password }),
	event   : 'user settings: change password: check current password'
})

export const reset_check_current_password_error = () =>
({
	type : 'user settings: change password: check current password: reset error'
})

export const change_password = (data) =>
({
	promise : http => http.patch(`/authentication/password`, data),
	event   : 'user settings: change password: change password'
})

export const reset_change_password_error = () =>
({
	type : 'user settings: change password: change password: reset error'
})