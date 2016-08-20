import { api } from '../common/webservice'

export default function()
{
	api
	(
		'User service',
		configuration.user_service.http,
		[
			require('./api/user'),
			require('./api/user.legacy')
		]
	)
}