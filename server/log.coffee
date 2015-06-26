bunyan = require 'bunyan'

console_output = new require('stream')
console_output.writable = yes

console_output.write = (data) ->
	console.log(data.msg)

development_log = 
	streams: [{
		type: "raw"
		stream: console_output
	}]
	serializers: {
		error    : bunyan.stdSerializers.err,
		request  : bunyan.stdSerializers.req,
		response : bunyan.stdSerializers.res,
	}

production_log = {}

log_configuration = if process.env.NODE_ENV == 'production' then production_log else development_log

module.exports = bunyan.createLogger(Object.extend({ name: "cinema" }, log_configuration))