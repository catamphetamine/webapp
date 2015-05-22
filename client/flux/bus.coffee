Bus = require('flux').Dispatcher

Bus.prototype.push = (event, data) ->
	@dispatch
		event : event
		data  : data

module.exports = new Bus()