export const sign_in = (info) =>
({
	promise : http => http.post(`/users/sign-in`, info),
	event   : 'user: sign in'
})

export const sign_in_reset_error = () =>
({
	type: 'user: sign in: reset error'
})

export const sign_out = () =>
({
	promise : http => http.post(`/users/sign-out`),
	event   : 'user: sign out'
})

export const register = (info) =>
({
	promise : http => http.post(`/users/register`, info),
	event   : 'user: register'
})

export const register_reset_error = () =>
({
	type: 'user: register: reset error'
})