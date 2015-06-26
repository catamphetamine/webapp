import bunyan from 'bunyan'

import stream from 'stream'
const console_output = new stream()
console_output.writable = true

console_output.write = data =>
{
	console.log(data.msg)
}

const development_log = 
{
	streams: [{
		type: 'raw',
		stream: console_output
	}],
	serializers: {
		error    : bunyan.stdSerializers.err,
		request  : bunyan.stdSerializers.req,
		response : bunyan.stdSerializers.res,
	}
}

const production_log = {}

const log_configuration = process.env.NODE_ENV === 'production' ? production_log : development_log

export default bunyan.createLogger(Object.extend({ name: 'cinema' }, log_configuration))