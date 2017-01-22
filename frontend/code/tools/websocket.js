// WebSocket connection

export default function connect_to_realtime_service()
{
	const websocket = new WebSocket(`ws://${configuration.realtime_service.host}:${configuration.realtime_service.port}`)

	websocket.addEventListener('error', (error) =>
	{
		console.error(error)
	})

	websocket.addEventListener('message', (event) =>
	{
		let message

		try
		{
			message = JSON.parse(event.data)
		}
		catch (error)
		{
			return console.error(error)
		}

		switch (message.command)
		{
			case 'GET /notifications':
				return console.log('Notifications', message.notifications)
			default:
				return console.log('Unknown message type', message)
		}
	})

	websocket.addEventListener('open', () =>
	{
		console.log('WebSocket connected')
		websocket.send(JSON.stringify({ command: 'GET /notifications' }))
		// To do: issue "GET /notifications" on reconnect.
	})

	websocket.addEventListener('close', ({ code, reason, wasClean }) =>
	{
		console.log('WebSocket disconnected. To do: start reconnect loop.')
	})
}