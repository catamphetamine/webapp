import { api } from '../common/webservice'

import password_api from './api/password'

export default function()
{
	return api
	(
		'Password service',
		configuration.password_service.http,
		[
			password_api
		]
	)
}