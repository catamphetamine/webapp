import online_store from './store/online store'
import store from './store/store'
import web_service from './web service'

// In future Node.js will throw uncaught Promise errors
catch_errors(async () =>
{
	await store.ready()
	await online_store.ready()
	const webservice = await web_service()

	process.on('SIGTERM', async () =>
	{
		log.info('Shutting down')
		await webservice.close()
		await store.close()
		await online_store.close()
		process.exit(0)
	})
})
