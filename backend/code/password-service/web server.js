import { api } from '../common/webservice'

api
(
	'Password service',
	configuration.password_service.http,
	[
		require('./api/password')
	]
)