import { api } from 'web-service'

api
({
	api            :
	[
		require('./api/user'),
		require('./api/user.legacy')
	],
	keys           : configuration.web_service_secret_keys,
	authentication : configuration.authentication_token_payload.read,
	log
})
.listen(configuration.user_service.http).then(() =>
{
	const { host, port } = configuration.api_service.http
	log.info(`Users service is listening at http://${host || 'localhost'}:${port}`)
},
error =>
{
	log.error(error, 'Users service failed to start')
})