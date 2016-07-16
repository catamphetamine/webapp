import { api } from 'web-service'

api
({
	api            :
	[
		require('./api/password')
	],
	keys           : configuration.web_service_secret_keys,
	authentication : configuration.authentication_token_payload.read,
	log
})
.listen(configuration.password_service.http).then(() =>
{
	const { host, port } = configuration.api_service.http
	log.info(`Password service is listening at http://${host || 'localhost'}:${port}`)
},
error =>
{
	log.error(error, 'Password service failed to start')
})