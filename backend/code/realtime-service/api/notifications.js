export default function(get_websocket)
{
	return function(api)
	{
		api.post('/notification', async function({ type, user_id })
		{
			// Do nothing if websocket hasn't yet been started
			// (websocket service starts after web service).
			if (!get_websocket())
			{
				return
			}

			console.log('@@@ Notify', type, user_id)

			const user_connections = get_websocket().user_connections[user_id]

			if (user_connections)
			{
				for (const socket of user_connections)
				{
					socket.send(JSON.stringify
					({
						type: 'notification',
						text
					}))
				}
			}
		})
	}
}