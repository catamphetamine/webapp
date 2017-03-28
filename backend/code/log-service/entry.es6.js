import log from './log'
import tcp_service from './tcp service'
import web_service from './web service'

global.log = log

// In future Node.js will throw uncaught Promise errors
catch_errors(async () =>
{
	const tcpservice = tcp_service()
	const webservice = await web_service()

	process.on('SIGTERM', async () =>
	{
		log.info('Shutting down')
		await new Promise(resolve => tcpservice.close(resolve))
		await webservice.close()
		process.exit(0)
	})
})
