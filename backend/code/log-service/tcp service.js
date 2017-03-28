import { server as tcp_server } from '../../../code/tcp'
import message_store            from './message store'

export default function()
{
	const server = tcp_server
	({
		name: 'Log service',
		host: configuration.log_service.tcp.host || 'localhost',
		port: configuration.log_service.tcp.port,
		// access_list: configuration.log_service.tcp.access_list
	})

	server.on('error', error =>
	{
		log.error(error, 'Shutting down due to an error')
	})

	server.on('session', messenger =>
	{
		let name = 'a client'

		messenger.on('connect', () =>
		{
			name = `"${messenger.other_party.name}"`
		})

		messenger.on('error', error =>
		{
			if (error.code === 'ECONNRESET')
			{
				return log.error(`Lost connection to ${name}`)
			}

			log.error(error, 'Messenger error')
		})

		messenger.on('message', function(message)
		{
			message_store.add(message)
		})
	})

	return server
}