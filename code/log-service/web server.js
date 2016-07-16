import web_service   from 'web-service'
import message_store from './message store'

const web = web_service
({
	keys           : configuration.web_service_secret_keys,
	authentication : configuration.authentication_token_payload.read,
	compress       : true,
	routing        : true,
	log
})

web.get('/', function()
{
	this.role('administrator')

	return message_store.messages.clone().reverse()
})

web.listen(configuration.log_service.http.port).then(() =>
{
	log.info(`Log server is listening at http://${configuration.log_service.http.host}:${configuration.log_service.http.port}`)
},
error =>
{
	log.error(error, 'Log service web server shutdown')
})