import { server as tcp_server } from '../common/tcp'

const server = tcp_server
({
	name: 'Log service',
	host: configuration.log_service.tcp.host,
	port: configuration.log_service.tcp.port
})

global.messages =
{
	messages: [],

	max: 1000,

	add: function(message)
	{
		if (this.messages.length === this.max)
		{
			this.messages.shift()
		}

		this.messages.push(message)
	}
}

server.on('error', error =>
{
	console.log('[log service] Log service shutdown')
	log.error(error)
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

		console.log('[log service] Messenger error')
		log.error(error)
	})

	messenger.on('message', function(message)
	{
		console.log('Message', message)
		messages.add(message)
	})
})

require('./web server')