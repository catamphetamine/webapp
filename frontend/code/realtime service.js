export default function set_up_realtime_service_connection()
{
	websocket.onMessage((message) =>
	{
		switch (message.command)
		{
			case 'GET /':
				return console.log('Connected', message)
			default:
				return console.log('Unknown message type', message)
		}
	})

	websocket.onOpen(() =>
	{
		console.log('WebSocket connected')

		websocket.send
		({
			command: 'GET /'
		})

		// To do: issue "GET /notifications" on reconnect.
	})
}