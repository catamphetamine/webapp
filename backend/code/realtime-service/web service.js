import { errors }    from 'web-service'
import { api }       from '../common/webservice'
import notifications_api from './api/notifications'

export default function start_web_service()
{
	return api
	(
		'Realtime service',
		configuration.realtime_service.http,
		[
			notifications_api
		]
	)
}