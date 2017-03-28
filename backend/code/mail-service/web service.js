import { api } from '../common/webservice'
import mail_api from './api/mail'

export default function(mailer)
{
	return api
	(
		'Mail service',
		configuration.mail_service.http,
		[
			mail_api(mailer)
		]
	)
}