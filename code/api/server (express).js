// this code is old and may be obsolete

import express       from 'express'
import session       from 'express-session'
import body_parser   from 'body-parser'

import configuration from '../configuration'
global.configuration = configuration

import json_rpc      from './json rpc'
import utility       from './api/utility'

import log           from './log'

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

function api()
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

			log.info(`Api server is up`)

			resolve()
		})
	})
}

api().then(() =>
{
	log.info(`Api server is listening at http://${configuration.api_server.http.host}:${configuration.api_server.http.port}`)
},
error =>
{
	log.error(error)
})

// log all errors
web.on('error', function(error, context)
{
	log.error(error, context)
})
\ No newline at end of file