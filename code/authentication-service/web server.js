import { api } from 'web-service'

api
({
	api            :
	[
		require('./api/authentication'),
		require('./api/authentication.legacy')
	],
	keys           : configuration.web_service_secret_keys,
	authentication : configuration.authentication_token_payload.read,
	log
})
.listen(configuration.authentication_service.http).then(() =>
{
	const { host, port } = configuration.api_service.http
	log.info(`Authentication service is listening at http://${host || 'localhost'}:${port}`)
},
error =>
{
	log.error(error, 'Authentication service failed to start')
})