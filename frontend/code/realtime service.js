import { throttle, once } from 'lodash-es'

import { connected, disconnected } from './redux/realtime service'

export default function set_up_realtime_service_connection()
{
	const activity_tracker = new Activity_tracker(websocket)

	websocket.onMessage((message, store) =>
	{
		switch (message.command)
		{
			case 'initialize':
				store.dispatch(connected())
				activity_tracker.connected()
				return console.log('Realtime service connected', message)
			default:
				return console.log('Unknown message type', message)
		}
	})

	websocket.onOpen((event, store) =>
	{
		websocket.send({ command: 'initialize' })
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