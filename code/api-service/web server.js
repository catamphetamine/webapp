import { api } from '../common/webservice'

api
(
	'API service',
	configuration.api_service.http,
	[
		require('./api/example')
	]
)