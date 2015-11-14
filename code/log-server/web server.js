import web_server from '../common/web server'

const web = web_server({ compress: true, session: true, parse_post_requests: true, routing: true })

web.get('/', () =>
{
	return messages.messages
})

web.listen(configuration.log_server.http.port).then(() =>
{
	log.info(`Log server is listening at http://${configuration.log_server.http.host}:${configuration.log_server.http.port}`)
},
error =>
{
	log.error(error)
})