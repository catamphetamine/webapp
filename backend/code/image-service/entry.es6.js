import database from './database'
import web_service from './web service'
import run_cleaner from './cleaner/cleaner'

// In future Node.js will throw uncaught Promise errors
catch_errors(async () =>
{
	const stop_cleaner = run_cleaner()
	await database.ready()
	const webservice = await web_service()

	process.on('SIGTERM', async () =>
	{
		log.info('Shutting down')
		stop_cleaner()
		await webservice.close()
		await database.close()
		process.exit(0)
	})
})
