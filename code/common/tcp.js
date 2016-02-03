// TCP client and server messaging.
//
// Has no durability guarantees 
// (messages will be lost in case of connection issues)
//
// Usage:
//
// const messenger = client({ host, port })
// messenger.send({ ... }).then(reply => ...)
//
// messenger.on('error', error => ...)
//
// // low level
// messenger.output.write({ ... })
//
// ...
//
// const messenger = server({ host, port })
//
// messenger.on('message', (data, reply) => ...)
//
// messenger.on('error', error => ...)
//
// // low level
// messenger.input.on('data', data => ...)

import net from 'net'
import stream from 'stream'
import util from 'util'
import EventEmitter from 'events'

const message_delimiter = '\f' // or '\n'

// a stream for decoding messages received on a TCP socket

function Message_decoder(parameters)
{
	stream.Transform.call(this, merge(parameters, { readableObjectMode: true, decodeStrings: false }))

	this.incomplete_message = ''
}

util.inherits(Message_decoder, stream.Transform)

Message_decoder.prototype._transform = function(text, encoding, callback)
{
	const last_delimiter_index = text.lastIndexOf(message_delimiter)

	if (last_delimiter_index < 0)
	{
		this.incomplete_message += text
		return callback()
	}

	const encoded_messages = this.incomplete_message + text.substring(0, last_delimiter_index)
	this.incomplete_message = text.substring(last_delimiter_index + 1)

	for (let message of encoded_messages.split(message_delimiter))
	{
		try
		{
			this.push(JSON.parse(message))
		}
		catch (error)
		{
			log.error(`Malformed JSON message`, message, error)
			return this.emit('error', error)
		}
	}

	callback()
}

Message_decoder.prototype._flush = function(callback)
{
	const message = this.incomplete_message

	try
	{
		this.push(JSON.parse(message))
	}
	catch (error)
	{
		log.error(`Malformed JSON message`, message, error)
		return this.emit('error', error)
	}

	callback()
}

// a stream for encoding JSON object messages being sent to a TCP socket

function Message_encoder(parameters)
{
	stream.Transform.call(this, merge(parameters, { writableObjectMode: true }))
}

util.inherits(Message_encoder, stream.Transform)

Message_encoder.prototype._transform = function(object, encoding, callback)
{
	// // append message delimiter to allow for packet fragmentation.
	// // prepend message delimiter to guard against packet loss in case of UDP, etc.
	// this.push(message_delimiter + JSON.stringify(object) + message_delimiter)
	this.push(JSON.stringify(object) + message_delimiter)
	callback()
}

// a stream which just sends all the written data into the void

function Annihilator(parameters)
{
	stream.Transform.call(this, merge(parameters, { writableObjectMode: true }))
}

util.inherits(Annihilator, stream.Transform)

Annihilator.prototype._transform = function(object, encoding, callback)
{
	callback()
	// setImmediate(callback)
}

const annihilator = new Annihilator()

// send and receive messages
// (experimental)
// (lossy)
// (not used yet)
class Messenger extends EventEmitter
{
	static message_timeout = 10 // in seconds

	constructor(output)
	{
		super()

		this.reset()

		this.incoming = this.incoming.bind(this)

		// the writable stream used for logging

		function Stream(parameters)
		{
			stream.Transform.call(this, merge(parameters, { objectMode: true }))
		}

		util.inherits(Stream, stream.Transform)

		const messenger = this

		Stream.prototype._transform = function(object, encoding, callback)
		{
			if (this._writableState.getBuffer().length > 1000)
			{
				return log.info(`Dropping message due to buffer overflow`, object)
			}

			this.push(object)
			callback()
		}

		this.stream = new Stream()
	}

	reset()
	{
		this.message_id = 1
		this.promises = {}
		this.timeouts = {}

		if (this.input)
		{
			this.input.removeListener('data', this.incoming)
		}

		this.input  = null
		this.output = null
	}

	send(data, _messenger_id = this.next_message_id())
	{
		if (!this.output)
		{
			throw new Error('Not yet connected')
		}

		if (this.closed)
		{
			throw new Error('The stream has been closed')
		}

		const message = 
		{
			_messenger_id,
			data
		}

		this.output.write(message)

		const promise = new Promise((resolve, reject) =>
		{
			this.promises[message._messenger_id] = 
			{
				resolve,
				reject
			}
		})

		this.timeouts[message._messenger_id] = setTimeout(() => this.message_timeout(message._messenger_id), Messenger.message_timeout * 1000)

		return promise
	}

	next_message_id()
	{
		if (this.message_id === Number.MAX_VALUE)
		{
			this.message_id = 1
		}

		return this.message_id++
	}

	closed()
	{
		log.debug(`Messenger connection closed`)

		this.reject_promises()

		this.reset()

		this.stream.unpipe(this.output)
	}

	connected(input, output)
	{
		log.debug(`Messenger connection established`)

		this.input  = input
		this.output = output

		this.input.on('data', this.incoming)

		this.stream.pipe(this.output)

		this.emit('connect')
	}

	ended(error)
	{
		this.reject_promises()

		this.reset()

		if (error)
		{
			this.emit('error', error)
		}

		this.closed = true
		this.emit('close')
	}

	incoming(message)
	{
		if (!message._messenger_id)
		{
			return
		}

		const promise = this.promises[message._messenger_id]

		if (!promise)
		{
			// log.info(`Got reply for an unknown message`, message.data)
			return this.emit('message', message.data, function reply(data)
			{
				this.send(data, message._messenger_id)
			}
			.bind(this))
		}

		promise.resolve(message.data)
		delete this.promises[message._messenger_id]

		clearTimeout(this.timeouts[message._messenger_id])
		delete this.timeouts[message._messenger_id]
	}

	reject_promises()
	{
		for (let message_id of Object.keys(this.promises))
		{
			this.promises[message_id].reject('shutdown')
			clearTimeout(this.timeouts[message_id])
		}
	}

	message_timeout(message_id)
	{
		this.promises[message_id].reject('timeout')
		delete this.promises[message_id]
		delete this.timeouts[message_id]
	}
}

// connects to the TCP server for sending JSON messages
export function client({ host, port })
{
	// TCP socket
	const socket = new net.Socket()

	// `log` global variable doesn't exist yet
	console.log(`Connecting to TCP server at ${host}:${port}`)

	// connect to the log server via TCP
	socket.connect({ host, port })

	// the data will be interpreted as UTF-8 data, and returned as strings
	socket.setEncoding('utf8')

	// constants
	const max_retries = undefined
	const reconnection_delays = [0, 100, 300, 700, 1500]

	// internal state
	// let connection_lost
	let reconnecting
	let retries_made

	// encodes JSON messages to their textual representation
	let message_encoder

	// decodes JSON messages from their textual representation
	let message_decoder

	// resets internal state
	function reset()
	{
		reconnecting = false
		retries_made = 0
		// connection_lost = false
	}

	function connection_lost()
	{
		// stop writing encoded JSON messages to the TCP socket
		if (message_encoder)
		{
			message_encoder.end()
		}
	}

	// When the TCP socket connection is successfully established
	socket.on('connect', function()
	{
		// in case of reconnect
		// if (reconnecting)
		// {
		// }

		// encodes JSON messages to their textual representation
		message_encoder = new Message_encoder()

		// stop write encoded JSON messages to the TCP socket,
		message_encoder.pipe(socket)

		// decodes JSON messages from their textual representation
		message_decoder = new Message_decoder()

		// on JSON message parse error
		message_decoder.on('error', error =>
		{
			socket.emit('error', error)
		})

		// receive JSON messages on TCP socket	
		socket.pipe(message_decoder)

		// reset internal state
		reset()

		messenger.connected(message_decoder, message_encoder)

		log.debug('Connected to TCP server')
	})

	// Emitted when an error occurs on the TCP socket. 
	// The 'close' event will be called directly following this event.
	socket.on('error', function(error)
	{
		log.debug('Lost connection to the TCP server') // , error)
	})

	// when TCP socket is closed
	socket.on('close', function(had_error)
	{
		connection_lost()

		if (message_decoder)
		{
			socket.unpipe(message_decoder)
			message_decoder.removeAllListeners('error')
		}

		if (message_encoder)
		{
			message_encoder.unpipe(socket)
		}

		messenger.closed()

		// log this event
		if (had_error)
		{
			log.debug('Connection closed due to an error')
		}
		else
		{
			log.debug('Connection closed')
		}

		// if should not try connecting further
		if (max_retries === 0)
		{
			log.info(`Will not try to reconnect further. Destroying socket.`)

			// indicate messenger shutdown
			return messenger.ended(new Error('Reconnection not allowed'))
		}

		// if was trying to reconnect to the server 
		// prior to receiving the TCP socket 'close' event,
		// then it means that reconnection attempt failed.
		if (reconnecting)
		{
			log.debug(`Reconnect failed`)

			// if max retries count limit reached, should stop trying to reconnect
			if (exists(max_retries) && retries_made === max_retries)
			{
				log.info(`Max retries count reached. Will not try to reconnect further.`)

				// indicate messenger shutdown
				return messenger.ended(new Error('Max reconnection retries count reached'))
			}
		}

		// now in the middle of reconnecting to the server
		reconnecting = true

		const reconnect = () =>
		{
			// if connection established before the reconnection timer fired, then do nothing
			if (!reconnecting)
			{
				return
			}

			log.debug(`Trying to reconnect`)

			retries_made++
			socket.connect({ host, port })
		}

		const reconnection_delay = retries_made < reconnection_delays.length ? reconnection_delays[retries_made] : reconnection_delays.last()

		reconnect.delay_for(reconnection_delay)
	})

	// create a duplex object stream

	// function Message_stream(parameters)
	// {
	// 	stream.Duplex.call(this, merge(parameters, { objectMode: true }))
	// }

	// util.inherits(Message_stream, stream.Duplex)

	// // when a JSON object is written to this stream
	// Message_stream.prototype._write = function(object, encoding, callback)
	// {
	// 	// if the connection to the TCP server is lost
	// 	if (connection_lost)
	// 	{
	// 		// then this message is also lost
	// 		// (may implement caching and retrying in the future)
	// 		return callback(new Error('Message lost due to connection issues'))
	// 	}
	//
	// 	// encode the JSON message into a utf-8 string 
	// 	// and send it down the TCP socket
	// 	message_encoder.write(object, undefined, callback)
	// }
	//
	// Message_stream.prototype._read = function(count)
	// {
	//
	// }

	// // All JSON objects written to the stream 
	// // will be encoded and sent to the TCP server
	// message_stream.pipe(message_encoder)

	// // create the message stream
	// const message_stream = new Message_stream()

	// // return the stream
	// return message_stream

	const messenger = new Messenger()

	return messenger
}

// creates a TCP server listening for JSON messages
export function server({ host, port })
{
	// create a transform stream

	// function Stream(parameters)
	// {
	// 	stream.Duplex.call(this, merge(parameters, { objectMode: true }))
	// }

	// util.inherits(Stream, stream.Duplex)

	// Stream.prototype._write = function(object, encoding, callback)
	// {
	// 	this.push(object)
	// 	callback()
	// }

	// const message_stream = new Stream()

	// set up a TCP server

	const server = net.createServer(socket =>
	{
		// the data will be interpreted as UTF-8 data, and returned as strings
		socket.setEncoding('utf8')
		
		// decodes textual message representation into a JSON object message
		const message_decoder = new Message_decoder()

		// on JSON message parse error
		message_decoder.on('error', error =>
		{
			socket.emit('error', error)
		})

		// read messages from the socket
		socket.pipe(message_decoder)

		// encodes JSON object message into a textual message representation
		const message_encoder = new Message_encoder()

		// write messages to the socket
		message_encoder.pipe(socket)

		const messenger = new Messenger()

		messenger.connected(message_decoder, message_encoder)

		// temporary variable
		let _error

		// Emitted when an error occurs on the TCP socket. 
		// The 'close' event will be called directly following this event.
		socket.on('error', function(error)
		{
			log.debug(`Socket error`, error)
			_error = error
		})

		// when TCP socket is closed
		socket.on('close', function(data)
		{
			log.debug(`Socket closed`)

			messenger.ended(_error)

			socket.unpipe(message_decoder)
			message_decoder.removeAllListeners('error')

			message_encoder.unpipe(socket)
		})

		server.emit('session', messenger)
	})

	log.info(`Starting TCP server at ${host}:${port}`)

	// start TCP server

	server.listen({ host, port }, error =>
	{
		if (error)
		{
			// log.error(error)
			// return message_stream.emit('error', error)
			log.error('Failed to start TCP server', error)
			return messenger.ended(new Error('Failed to start TCP server'))
		}

		log.debug(`TCP server is listening`)
	})

	return server
}

// local machine sockets:
//
// if (process.platform === 'win32')
// {
// 	path = path.replace(/^\//, '').replace(/\//g, '-')
// 	path = `\\\\.\\pipe\\${path}`
// }
//
// const socket = net.connect({ path: path })

// tls:
//
// const tls = {}
//
// tls.key = fs.readFileSync(private)
// tls.cert = fs.readFileSync(public)
//
// tls.ca = [fs.readFileSync(tls.trustedConnections)]
//
// tls.host =
// tls.port =
//
// const socket = tls.connect(tls)