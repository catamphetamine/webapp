import web_server from '../common/web server'

const web = web_server
({
	compress            : true,
	authentication      : configuration.authentication_token_payload.read || (() => ({})),
	parse_post_requests : true,
	routing             : true
})

web.get('/', function()
{
	this.role('administrator')

	return messages.messages.clone().reverse()
})

web.listen(configuration.log_service.http.port).then(() =>
{
	log.info(`Log server is listening at http://${configuration.log_service.http.host}:${configuration.log_service.http.port}`)
},
error =>
{
	console.log('Log service web server shutdown')
	log.error(error)
})