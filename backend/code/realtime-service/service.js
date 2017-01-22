// https://github.com/uWebSockets/uWebSockets
import WebSocket from 'uws'

export default function start()
{
	const server = new WebSocket.Server({ port: configuration.realtime_service.port })

	// Broadcasts to all
	server.broadcast = function broadcast(message)
	{
		for (let client of server.clients)
		{
			if (client.readyState === WebSocket.OPEN)
			{
				client.send(message)
			}
		}
	}

	server.on('connection', (socket) =>
	{
		log.info('Client connected')

		// Broadcasts to everyone else
		socket.broadcast = (message) =>
		{
			for (let client of server.clients)
			{
				if (client !== socket && client.readyState === WebSocket.OPEN)
				{
					client.send(message)
				}
			}
		}

		socket.on('close', () =>
		{
			log.info('Client disconnected')
		})

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