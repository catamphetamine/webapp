import { api } from 'web-service'

api
({
	api            :
	[
		require('./api/example')
	],
	keys           : configuration.web_service_secret_keys,
	authentication : configuration.authentication_token_payload.read,
	log
})
.listen(configuration.api_service.http).then(() =>
{
	const { host, port } = configuration.api_service.http
	log.info(`API service is listening at http://${host || 'localhost'}:${port}`)
},
error =>
{
	log.error(error, 'API service failed to start')
})