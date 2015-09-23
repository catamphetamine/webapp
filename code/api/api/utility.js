import fs from 'fs'

/* export */ const load = json => JSON.parse(fs.readFileSync(json, 'utf8'))
// global.load = load

export default class utility
{
	static settings(parameters)
	{
		return new Promise((resolve, reject) =>
		{
			const public_fields = [
				'putin'
				// 'webserver.http.host'
				// 'webserver.http.port'
			]

			const settings = {}

			for (let path of public_fields) {
				Object.set_value_at_path(settings, path, Object.get_value_at_path(configuration, path))
			}

			settings.version = load(`${Root_folder}/package.json`).version

			resolve(settings)
		})
	}

	static ping(parameters)
	{
		return Promise.resolve(true)
	}
}