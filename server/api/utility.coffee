class utility
	$public_settings: (parameters, callback) ->
		public_fields = [
			'putin'
		]

		settings = {}

		for path in public_fields
			Object.set_value_at_path(settings, path, Object.get_value_at_path(configuration, path))

		settings.version       = require("#{Root_folder}/package.json").version

		callback(no, settings)

	$public_ping: (parameters, callback) ->
		callback()

module.exports = utility