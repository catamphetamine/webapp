import { api } from 'web-service'

api
({
	api            :
	[
		require('./api/mail')
	],
	keys           : configuration.web_service_secret_keys,
	authentication : configuration.authentication_token_payload.read,
	access_list    : configuration.mail_service.access_list,
	log
})
.listen(configuration.mail_service.http).then(() =>
{
	const { host, port } = configuration.api_service.http
	log.info(`Mail service is listening at http://${host || 'localhost'}:${port}`)
},
error =>
{
	log.error(error, 'Mail service failed to start')
})