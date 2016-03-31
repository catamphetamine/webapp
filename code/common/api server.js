import web_server from '../common/web server'

import path from 'path'
import fs   from 'fs'

import Url  from '../client/tools/url'

export default function(options = {})
{
	if (options.authentication === true)
	{
		options.authentication = configuration.authentication_token_payload.read || (() => ({}))
	}

	const web = web_server({ ...options, compress: true, routing: true })

	global.api = {}
	global.api.legacy = {}

	for (let method of ['get', 'put', 'patch', 'post', 'delete'])
	{
		global.api[method] = web[method]

		global.api.legacy[method] = function(route, handler, error_handler)
		{
			web[method](route, async function(parameters)
			{
				try
				{
					return { redirect: await handler.apply(this, arguments) }
				}
				catch (error)
				{
					// log the error, if it's not a normal Api error
					// (prevents log pollution with things like 
					//  `404 User not found` or `401 Not authenticated`)
					if (!exists(error.code))
					{
						log.error(error, 'Api service error')
					}

					const url = error_handler.call(this, error)

					const redirect = new Url(url).set_parameters
					({
						...parameters, 
						error_code : error.code, 
						error      : error.message 
					})
					.print()

					return { redirect }
				}
			})
		}
	}

	const api_folder = path.join(path.dirname(module.parent.filename), 'api')

	for (let file of fs.readdirSync(api_folder))
	{
		// fs.statSync(path).isDirectory()

		log.info('loading api module', file)
		require(path.join(api_folder, file))
	}

	global.Errors = web.errors

	const result = 
	{
		start: ({ host, port }) =>
		{
			web.listen(port, host).then(() =>
			{
				log.info(`${options.name} service is listening at http://${host || 'localhost'}:${port}`)
			},
			error =>
			{
				log.error(error, 'Api service shutdown')
			})
		}
	}

	return result
}