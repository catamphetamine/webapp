import koa         from 'koa'
import session     from 'koa-session'
import body_parser from 'koa-bodyparser'
import mount       from 'koa-mount'

import configuration from '../configuration'
global.configuration = configuration

import json_rpc      from './json rpc'
import utility       from './api/utility'

import log           from './log'

json_rpc.add('utility', utility)

const web = koa()

web.keys = ['hammertime']
web.use(session(web))

web.use(body_parser())
// this.request.body

// handle errors
web.use(function* (next)
{
	try
	{
		yield next
	}
	catch (error)
	{
		// log the error
		log.error(error)
		// this.app.emit('error', error, this)

		yield this.body =
		{
			jsonrpc : '2.0',
			id      : this.request.body.id,
			method  : this.request.body.method,
			error:
			{
				code    : -32603,
				message : 'Internal error'
			}
		}
	}
})

function api()
{
	return new Promise((resolve, reject) =>
	{
		web.use(mount('/', function*()
		{
			// const version = http_request.params[0]
			// log.info(`requested api version: ${version}`)

			const request = this.request.body

			yield json_rpc.process(request).then(response =>
			{
				this.body = response
			}, 
			error =>
			{
				log.error(error)
				this.body = json_rpc.error(request)
			})
		}))

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