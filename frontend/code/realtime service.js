import { throttle, once } from 'lodash-es'
import { getHttpClient } from 'react-isomorphic-render'

import { connected, disconnected } from './redux/realtime service'

export default function set_up_realtime_service_connection()
{
	// `websocket` is a global variable set by `react-isomorphic-render`
	const activity_tracker = new Activity_tracker(websocket)

	websocket.onMessage(async (message, store) =>
	{
		if (message.command)
		{
			switch (message.command)
			{
				case 'initialized':
					store.dispatch(connected())
					activity_tracker.connected()

					const notifications = await getHttpClient().get('/social', { bot: true })
					console.log('Notifications', notifications)

					return console.log('Realtime service connected', message)
				default:
					return console.log('Unknown message type', message)
			}
		}
	})

	websocket.onOpen((event, store) =>
	{
		const message = { command: 'initialize' }

		// Track multiple tabs of the same guest user
		if (!store.user)
		{
			message.guest = get_guest_id()
		}

		websocket.send(message)
	})

	websocket.onClose((event, store) =>
	{
		store.dispatch(disconnected())
		activity_tracker.disconnected()
	})
}

class Activity_tracker
{
	is_active = false
	is_active_timeout = undefined

	constructor(websocket)
	{
		this.websocket = websocket

		this.track = this.track.bind(this)
		this.on_user_activity = this.on_user_activity.bind(this)

		// `initialize` command is issued each time a client reconnects
		// therefore set up user activity tracking only once
		this.connected = once(this.track)
	}

	track()
	{
		const on_user_activity_throttled = throttle(this.on_user_activity, 30 * 1000, { trailing: false });

		window.addEventListener('click',    on_user_activity_throttled)
		window.addEventListener('keypress', on_user_activity_throttled)
		window.addEventListener('scroll',   on_user_activity_throttled)
	}

	on_user_activity()
	{
		this.websocket.send({ command: 'active' })

		if (this.is_active)
		{
			clearTimeout(this.is_active_timeout)
		}
		else
		{
			this.is_active = true
		}

		this.is_active_timeout = setTimeout(() =>
		{
			this.is_active = false
			this.websocket.send({ command: 'inactive' })
		},
		60 * 1000)
	}

	disconnected()
	{
		if (this.is_active)
		{
			clearTimeout(this.is_active_timeout)
		}
	}
}

// Track multiple tabs of the same guest user
function get_guest_id()
{
	if (!localStorage.getItem('guest_id'))
	{
		localStorage.setItem('guest_id', String(Math.random()).slice(2))
	}

	return localStorage.getItem('guest_id')
}