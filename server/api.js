import express       from 'express'
import session       from 'express-session'
import body_parser   from 'body-parser'

import configuration from './configuration'

import json_rpc      from './libraries/json rpc'
import utility       from './api/utility'

json_rpc.add('utility', utility)

const web = express()

web.use(session
({
	secret: 'beast breaker',
	resave: false,
	saveUninitialized: false,
	cookie: { maxAge: 60000 }
}))

web.use(body_parser.json())

export default function api()
{
	return new Promise((resolve, reject) =>
	{
		web.post('/', (http_request, http_response) =>
		{
			// const version = http_request.params[0]
			// log.info(`requested api version: ${version}`)

			const request = http_request.body

			json_rpc.process(request).then(response =>
			{
				http_response.send(response)
			}, 
			error =>
			{
				log.error(error)
				http_response.send(json_rpc.error(request))
			})
		})

		web.listen(configuration.api_server.http.port, (error) =>
		{
			if (error)
			{
				return reject(error)
			}

			resolve()
		})
	})
}