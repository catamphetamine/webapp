import { api } from '../common/webservice'
import authentication_api from './api/authentication'
import authentication_api_legacy from './api/authentication.legacy'
import authentication_password_api from './api/authentication.password'

export default function()
{
	api
	(
		'Authentication service',
		configuration.authentication_service.http,
		[
			authentication_api,
			authentication_api_legacy,
			authentication_password_api
		]
	)
}