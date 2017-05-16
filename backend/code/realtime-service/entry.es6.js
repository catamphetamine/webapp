import start_websocket_service from './websocket service'
import start_web_service from './web service'

// In future Node.js will throw uncaught Promise errors
catch_errors(async () =>
{
	// First start HTTP REST API, then start websocket service,
	// because this way it is 100% assured that the realtime service
	// will be already accepting notification pushes
	// when the user connects to websocket service
	// and gets his `notifications` via HTTP after that.
	// Therefore no notifications pushed from other services
	// via HTTP REST API will be lost (hypothetically).
	// (and for that to happen the notifications must be sent
	//  to realtime service after they have been persisten in a database)
	let websocket

	// The webservice must only be accessible from the inside
	// (i.e. not listening on an external IP address, not proxied to)
	// otherwise an attacker could push any notifications to all users.
	// Therefore, only WebSocket connections should be proxied (e.g. using NginX).
	const webservice = await start_web_service(() => websocket)
	websocket = start_websocket_service()

	process.on('SIGTERM', async () =>
	{
		log.info('Shutting down')
		await websocket.close()
		await webservice.close()
		process.exit(0)
	})
})
