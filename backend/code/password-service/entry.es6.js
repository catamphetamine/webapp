import web_service from './web service'

// In future Node.js will throw uncaught Promise errors
catch_errors(async () =>
{
	const webservice = await web_service()

	process.on('SIGTERM', async () =>
	{
		log.info('Shutting down')
		await webservice.close()
		process.exit(0)
	})
})
