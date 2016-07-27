import { api }       from '../common/webservice'
import message_store from './message store'

const service = api
(
	'Log service',
	configuration.log_service.http.port,
	[
		function(api)
		{
			api.get('/', function()
			{
				this.role('administrator')

				return message_store.messages.clone().reverse()
			})
		}
	]
)