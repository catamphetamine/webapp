import { api } from '../common/webservice'

import poster_api from './api/poster'
import stream_api from './api/stream'
import notifications_api from './api/notifications'

export default function()
{
	return api
	(
		'Social service',
		configuration.social_service.http,
		[
			poster_api,
			stream_api,
			notifications_api
		]
	)
}