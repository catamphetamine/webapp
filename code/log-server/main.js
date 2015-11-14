import { server as tcp_server } from '../common/tcp'

const server = tcp_server({ host: configuration.log_server.tcp.host, port: configuration.log_server.tcp.port })

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

server.on('data', function(message)
{
	// log.info(`##################################################### Message received`, message)
	messages.add(message)
})

require('./web server')