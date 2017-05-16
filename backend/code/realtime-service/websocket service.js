// https://github.com/uWebSockets/uWebSockets
import WebSocket from 'uws'
import { http, verify_jwt } from 'web-service'

import start_metrics from '../../../code/metrics'

export default function start()
{
	const metrics = start_metrics
	({
		statsd:
		{
			...configuration.statsd,
			prefix : 'realtime_service'
		}
	})

	const visitor_tracker = new Visitor_tracker(metrics)
	visitor_tracker.report()

	const server = new WebSocket.Server({ port: configuration.realtime_service.websocket.port })

	const user_connections = {}

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
		// log.info('Client connected. Total clients:', server.clients.length)

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
				// log.info('Client disconnected. Clients left:', server.clients.length)
				visitor_tracker.disconnected(socket)
			}
			catch (error)
			{
				log.error(error)
			}

			if (socket.user_id)
			{
				user_connections[socket.user_id].remove(socket)
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
					case 'initialize':

						// If a user connected (not a guest)
						// then store `userId` for push notifications.
						// Using an authentication token here
						// instead of simply taking `userId` out of the `message`
						// because the input can't be trusted (could be a hacker).
						if (message.token)
						{
							// (make sure `socket.user_id` is a `String`)
							// The token could be a JWT token (jwt.io)
							// and `authenticateUserByToken` function could
							// check the token's authenticity (by verifying its signature)
							// and then extract `userId` out of the token payload.
							const payload = verify_jwt(message.token, configuration.web_service_secret_keys, { ignoreExpiration: true })
							console.log('@@@@@@@@@@@@@@', payload)
							socket.user_id = payload.sub

							if (!user_connections[socket.user_id])
							{
								user_connections[socket.user_id] = []
							}

							user_connections[socket.user_id].push(socket)
						}

						const response =
						{
							command: 'initialized'
						}

						if (!socket.user_id)
						{
							socket.guest_id = message.guest
						}

						visitor_tracker.connected(socket)

						return socket.send(JSON.stringify(response))

					case 'active':
						// if (socket.user_id)
						// {
						// 	http.post
						// 	(
						// 		`${address_book.user_service}/ping`,
						// 		undefined,
						// 		{ headers: { Authorization: `Bearer ${socket.token}` } }
						// 	)
						// }
						return visitor_tracker.active(socket)

					case 'inactive':
						return visitor_tracker.inactive(socket)

					default:
						return socket.send(JSON.stringify
						({
							status: 404,
							error: `Unknown command: ${message.command}`
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

	log.info(`Realtime service WebSocket is listening at port ${configuration.realtime_service.websocket.port}`)

	const result =
	{
		server,
		close: () => new Promise(resolve => server.close(resolve)),
		user_connections
	}

	return result
}

// These counters ("state") could be stored somewhere in Redis,
// but since it's no big deal they're just stored
// in the current Node.js process' memory
// and are discarded in case of a restart.
class Visitor_tracker
{
	users_online = 0
	guests_online = 0

	active_user_connections = {}
	active_guest_connections = {}

	constructor(metrics)
	{
		this.metrics = metrics

		this.one_more_active_user = this.one_more_active_user.bind(this)
		this.one_less_active_user = this.one_less_active_user.bind(this)
		this.one_more_active_guest = this.one_more_active_guest.bind(this)
		this.one_less_active_guest = this.one_less_active_guest.bind(this)
	}

	active(socket)
	{
		// If this connection is not transitioning
		// from `inactive` to `active` then no changes.
		if (socket.active)
		{
			return
		}

		if (socket.user_id)
		{
			this._active(socket.user_id, this.active_user_connections, this.one_more_active_user)
		}
		else
		{
			this._active(socket.guest_id, this.active_guest_connections, this.one_more_active_guest)
		}

		socket.active = true
	}

	_active(id, connections, one_more_active_visitor)
	{
		// If connected for the first time
		if (connections[id] === 0)
		{
			one_more_active_visitor()
		}

		// One more connection
		connections[id]++
	}

	inactive(socket)
	{
		if (socket.user_id)
		{
			this._inactive(socket.user_id, this.active_user_connections, this.one_less_active_user)
		}
		else
		{
			this._inactive(socket.guest_id, this.active_guest_connections, this.one_less_active_guest)
		}

		socket.active = false
	}

	_inactive(id, connections, one_less_active_visitor)
	{
		// One less active connection
		connections[id]--

		// If it was the last connection
		if (connections[id] === 0)
		{
			one_less_active_visitor()
		}
	}

	connected(socket)
	{
		if (socket.user_id)
		{
			this._connected(socket.user_id, this.active_user_connections)
		}
		else
		{
			this._connected(socket.guest_id, this.active_guest_connections)
		}
	}

	_connected(id, connections)
	{
		// Initialize connection counter
		if (connections[id] === undefined)
		{
			connections[id] = 0
		}
	}

	disconnected(socket)
	{
		if (socket.active)
		{
			this.inactive(socket)
		}
	}

	one_more_active_user()
	{
		this.users_online++
		this.metrics.report('users_online', this.users_online)
	}

	one_less_active_user()
	{
		this.users_online--
		this.metrics.report('users_online', this.users_online)
	}

	one_more_active_guest()
	{
		this.guests_online++
		this.metrics.report('guests_online', this.guests_online)
	}

	one_less_active_guest()
	{
		this.guests_online--
		this.metrics.report('guests_online', this.guests_online)
	}

	report()
	{
		this.metrics.report('users_online', this.users_online)
		this.metrics.report('guests_online', this.guests_online)
	}
}