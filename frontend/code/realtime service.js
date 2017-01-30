import { connected, disconnected } from './redux/realtime service'

export default function set_up_realtime_service_connection()
{
	websocket.onMessage((message, store) =>
	{
		switch (message.command)
		{
			case 'GET /':
				store.dispatch(connected())
				return console.log('Realtime service connected', message)
			default:
				return console.log('Unknown message type', message)
		}
	})

	websocket.onOpen((event, store) =>
	{
		websocket.send
		({
			command: 'GET /'
		})
	})

	websocket.onClose((event, store) =>
	{
		store.dispatch(disconnected())
	})
}