import web_server from '../common/web server'

import path from 'path'
import fs   from 'fs'

export default function(options = {})
{
	const web = web_server({ ...options, compress: true, parse_post_requests: true, routing: true })

	global.api = {}

	for (let method of ['get', 'put', 'patch', 'post', 'delete'])
	{
		global.api[method] = web[method]
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
				log.info(`Authentication service is listening at http://${host || 'localhost'}:${port}`)
			},
			error =>
			{
				log.error(error)
			})
		}
	}

	return result
}