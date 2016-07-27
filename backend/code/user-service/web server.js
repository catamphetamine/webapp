import { api } from '../common/webservice'

api
(
	'User service',
	configuration.user_service.http,
	[
		require('./api/user'),
		require('./api/user.legacy')
	]
)
