import Mailer from './mailer'
import web_service from './web service'

// In future Node.js will throw uncaught Promise errors
catch_errors(async () =>
{
	const mailer = new Mailer()
	const webservice = await web_service(mailer)

	process.on('SIGTERM', async () =>
	{
		log.info('Shutting down')
		await webservice.close()
		await mailer.close()
		process.exit(0)
	})
})
