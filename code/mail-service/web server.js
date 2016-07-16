import { api } from 'web-service'

api
({
	name           : 'Mail',
	api            :
	[
		require('./api/mail')
	],
	keys           : configuration.web_service_secret_keys,
	authentication : configuration.authentication_token_payload.read,
	access_list    : configuration.mail_service.access_list,
	log
})
.listen(configuration.mail_service.http)