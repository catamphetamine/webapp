// WebSocket connection

export default function connect_to_realtime_service(authentication_token)
{
	const websocket = new WebSocket(`ws://${configuration.realtime_service.websocket.host}:${configuration.realtime_service.websocket.port}`)

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
			case 'GET /':
				return console.log('Connected', message)
			default:
				return console.log('Unknown message type', message)
		}
	})

	websocket.addEventListener('open', () =>
	{
		console.log('WebSocket connected')

		websocket.send(JSON.stringify
		({
			command: 'GET /',
			token: authentication_token
		}))

		// To do: issue "GET /notifications" on reconnect.
	})

	websocket.addEventListener('close', ({ code, reason, wasClean }) =>
	{
		console.log('WebSocket disconnected. To do: start reconnect loop.')
	})
}