import { errors }    from 'web-service'
import { api }       from '../common/webservice'
import log_api       from './api/log'

export default function()
{
	return api
	(
		'Log service',
		configuration.log_service.http,
		[
			log_api
		]
	)
}