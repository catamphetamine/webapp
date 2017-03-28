import { api } from '../common/webservice'
import access_token_api from './api/access tokens'

export default function()
{
	return api
	(
		'Access token service',
		configuration.access_token_service.http,
		[
			access_token_api
		],
		{
			is_access_token_service: true
		}
	)
}