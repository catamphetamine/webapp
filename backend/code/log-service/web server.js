import { errors }    from 'web-service'
import { api }       from '../common/webservice'
import log_api       from './api/log'

export default function()
{
	api
	(
		'Log service',
		configuration.log_service.http.port,
		[
			log_api
		]
	)
}