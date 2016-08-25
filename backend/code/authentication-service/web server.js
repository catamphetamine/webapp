import { api } from '../common/webservice'

api
(
	'Authentication service',
	configuration.authentication_service.http,
	[
		require('./api/authentication'),
		require('./api/authentication.legacy')
	]
)