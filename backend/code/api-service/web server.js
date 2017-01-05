import { api } from '../common/webservice'

import example_api from './api/example'

export default function()
{
	api
	(
		'API service',
		configuration.api_service.http,
		[
			example_api
		]
	)
}