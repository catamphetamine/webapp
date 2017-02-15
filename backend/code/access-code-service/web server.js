import { api } from '../common/webservice'
import access_code_api from './api/access codes'

export default function()
{
	api
	(
		'Access code service',
		configuration.access_code_service.http,
		[
			access_code_api
		]
	)
}