import { api } from '../common/webservice'

export default function()
{
	api
	(
		'Authentication service',
		configuration.authentication_service.http,
		[
			require('./api/authentication'),
			require('./api/authentication.legacy')
		]
	)
}