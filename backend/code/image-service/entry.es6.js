import database from './database'
import web_service from './web service'

// In future Node.js will throw uncaught Promise errors
catch_errors(async () =>
{
	await database.ready()
	const webservice = await web_service()

	process.on('SIGTERM', async () =>
	{
		log.info('Shutting down')
		await webservice.close()
		await database.close()
		process.exit(0)
	})
})
