import { api } from 'web-service'

api
({
	name           : 'API',
	api            :
	[
		require('./api/example')
	],
	keys           : configuration.web_service_secret_keys,
	authentication : configuration.authentication_token_payload.read,
	log
})
.listen(configuration.api_service.http)