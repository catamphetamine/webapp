import { api } from '../common/webservice'

import user_api from './api/user'
import user_api_legacy from './api/user.legacy'

export default function()
{
	return api
	(
		'User service',
		configuration.user_service.http,
		[
			user_api,
			user_api_legacy
		]
	)
}