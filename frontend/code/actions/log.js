export const get = () =>
({
	promise : http => http.get('/log'),
	event   : 'log: fetch'
})