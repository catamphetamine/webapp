import { api } from 'web-service'

api
({
	name           : 'Password',
	api            :
	[
		require('./api/password')
	],
	keys           : configuration.web_service_secret_keys,
	authentication : configuration.authentication_token_payload.read,
	log
})
.listen(configuration.password_service.http)