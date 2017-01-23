// https://github.com/uWebSockets/uWebSockets
import WebSocket from 'uws'
import { http } from 'web-service'

export default function start()
{
	const server = new WebSocket.Server({ port: configuration.realtime_service.websocket.port })

	// Broadcasts to all
	server.broadcast = function broadcast(message)
	{
		server.clients.forEach((client) =>
		{
			if (client.readyState === WebSocket.OPEN)
			{
				client.send(message)
			}
		})
	}

	server.on('connection', (socket) =>
	{
		log.info('Client connected. Total clients:', server.clients.length)

		// Broadcasts to everyone else
		socket.broadcast = (message) =>
		{
			server.clients.forEach((client) =>
			{
				if (client !== socket && client.readyState === WebSocket.OPEN)
				{
					client.send(message)
				}
			})
		}

		socket.on('close', async () =>
		{
			try
			{
				log.info('Client disconnected. Clients left:', server.clients.length)
			}
			catch (error)
			{
				log.error(error)
			}
		})

		socket.on('message', async (message) =>
		{
			try
			{
				message = JSON.parse(message)
			}
			catch (error)
			{
				return log.error(error)
			}

			try
			{
				switch (message.command)
				{
					case 'GET /':
						const response =
						{
							command: 'GET /'
						}

						const token = message.token

						if (token)
						{
							const user = await http.get
							(
								`${address_book.user_service}`,
								{ bot: true },
								{ headers: { Authorization: `Bearer ${token}` } }
							)

							if (user)
							{
								response.user = user
								response.notifications = []
							}
						}

						return socket.send(JSON.stringify(response))

					default:
						return socket.send(JSON.stringify
						({
							status: 404,
							error: 'Unknown command'
						}))
				}
			}
			catch (error)
			{
				log.error(error)
			}
		})
	})

	server.on('error', (error) =>
	{
		log.error(error)
	})

	log.info(`Realtime service is listening at port ${configuration.realtime_service.websocket.port}`)
}