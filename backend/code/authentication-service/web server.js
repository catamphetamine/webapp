import { api } from '../common/webservice'
import authentication_api from './api/authentication'

export default function()
{
	api
	(
		'Authentication service',
		configuration.authentication_service.http,
		[
			authentication_api
		]
	)
}