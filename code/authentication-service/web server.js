import { api } from 'web-service'

api
({
	name           : 'Authentication',
	api            :
	[
		require('./api/authentication'),
		require('./api/authentication.legacy')
	],
	keys           : configuration.web_service_secret_keys,
	authentication : configuration.authentication_token_payload.read,
	log
})
.listen(configuration.authentication_service.http)