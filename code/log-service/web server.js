import web_server from '../common/web server'

const web = web_server({ compress: true, authentication: true, parse_post_requests: true, routing: true })

web.get('/', () =>
{
	return messages.messages.clone().reverse()
})

web.listen(configuration.log_service.http.port).then(() =>
{
	log.info(`Log server is listening at http://${configuration.log_service.http.host}:${configuration.log_service.http.port}`)
},
error =>
{
	log.error(error)
})