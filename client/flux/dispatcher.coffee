Dispatcher = require('flux').Dispatcher

Dispatcher.prototype.do = (event, data) ->
	@dispatch
		event : event
		data  : data

module.exports = new Dispatcher()