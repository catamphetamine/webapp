// https://github.com/uWebSockets/uWebSockets
import WebSocket from 'uws'
import { http } from 'web-service'

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
						const response =
						{
							command: 'initialize'
						}

						const token = message.token

						if (token)
						{
							try
							{
								const user = await http.get
								(
									address_book.user_service,
									{ bot: true },
									{ headers: { Authorization: `Bearer ${token}` } }
								)

								if (user)
								{
									socket.user = user
									socket.token = token

									response.user = user
									response.notifications = await http.get
									(
										`${address_book.social_service}`,
										{ bot: true },
										{ headers: { Authorization: `Bearer ${token}` } }
									)
								}
							}
							catch (error)
							{
								log.error(error)
							}
						}

						if (!socket.user)
						{
							socket.guest_id = message.guest
						}

						visitor_tracker.connected(socket)

						return socket.send(JSON.stringify(response))

					case 'active':
						if (socket.user)
						{
							http.post
							(
								`${address_book.user_service}/ping`,
								undefined,
								{ headers: { Authorization: `Bearer ${socket.token}` } }
							)
						}
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

	return server
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

		if (socket.user)
		{
			this._active(socket.user.id, this.active_user_connections, this.one_more_active_user)
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
		if (socket.user)
		{
			this._inactive(socket.user.id, this.active_user_connections, this.one_less_active_user)
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
		if (socket.user)
		{
			this._connected(socket.user.id, this.active_user_connections)
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