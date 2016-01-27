import { server as tcp_server } from '../common/tcp'

const server = tcp_server({ host: configuration.log_service.tcp.host, port: configuration.log_service.tcp.port })

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

server.input.on('data', function(message)
{
	messages.add(message)
})

require('./web server')