import { api } from '../common/webservice'

api
(
	'Mail service',
	configuration.mail_service.http,
	[
		require('./api/mail')
	]
)