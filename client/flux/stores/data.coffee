React = require 'react'

Bus = require '../bus'

Data = React.Store
	helper_method: () ->
		console.log 'some helper method here'

Data.listen Bus, 
	settings: (data) ->
		Data.settings = data
		Data.notify('settings_changed')

module.exports = Data