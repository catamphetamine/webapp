// https://github.com/uWebSockets/uWebSockets
import websocket from 'uws'

export default function start()
{
	const server = new websocket.Server({ port: configuration.realtime_service.port })

	server.on('connection', (socket) =>
	{
		log.info('Client connected')

		socket.on('message', (message) =>
		{
			try
			{
				message = JSON.parse(message)
			}
			catch (error)
			{
				return log.error(error)
			}

			log.info('WebSocket message received:', message)

			switch (message.command)
			{
				case 'GET /notifications':
					return socket.send(JSON.stringify({ command: 'GET /notifications', notifications: [] }))
				default:
					return socket.send(JSON.stringify({ status: 404, error: 'Unknown command' }))
			}
		})
	})

	log.info(`Realtime service is listening at port ${configuration.realtime_service.port}`)
}