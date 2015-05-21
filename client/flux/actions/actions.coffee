Dispatcher = require '../dispatcher'

api = require '../../scripts/libraries/api'

Actions = 

	get_settings: ->
		# просто так; по идее, это можно использовать, 
		# чтобы показывать какую-нибудь крутилку на экране, 
		# или статус писать где-нибудь в панели статусов
		Dispatcher.do 'retrieving settings'

		api.call('utility.settings').then (settings) ->
			Dispatcher.do 'settings', settings

module.exports = Actions