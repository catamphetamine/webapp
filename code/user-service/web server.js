import { api } from 'web-service'

api
({
	name           : 'Users',
	api            :
	[
		require('./api/user'),
		require('./api/user.legacy')
	],
	keys           : configuration.web_service_secret_keys,
	authentication : configuration.authentication_token_payload.read,
	log
})
.listen(configuration.user_service.http)