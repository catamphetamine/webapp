// https://github.com/uWebSockets/uWebSockets
import websocket from 'uws'

export default function start()
{
	const server = new websocket.Server({ port: configuration.realtime_service.ws.port })

	server.on('connection', (socket) =>
	{
		log.info('Client connected')

		socket.on('message', (message) =>
		{
			log.info('received:', message)
		})

		socket.send('something')
	})

	log.info(`Realtime service is listening at port ${configuration.realtime_service.ws.port}`)
}