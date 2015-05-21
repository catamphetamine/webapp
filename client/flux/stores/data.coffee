React = require 'react'

Dispatcher = require '../dispatcher'

Data = React.Store
	service_method: (data) ->
		console.log 'some service method here'

React.dispatch Dispatcher, 
	settings: (data) ->
		Data.settings = data
		Data.emit('settings_changed')

module.exports = Data