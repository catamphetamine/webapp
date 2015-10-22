import koa          from 'koa'
import session      from 'koa-session'
import body_parser  from 'koa-bodyparser'
import mount        from 'koa-mount'
import graphql_http from 'koa-graphql'
import koa_router   from 'koa-router'

import configuration from '../configuration'
global.configuration = configuration

import log from './log'

import path from 'path'
import fs   from 'fs'

const web = koa()

const router = koa_router()

web.keys = ['hammertime']
web.use(session(web))

// Usage: this.request.body
web.use(body_parser({ formLimit: '100mb' }))

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

		this.status = error.code || 500
		this.message = error.message || 'Internal error'
	}
})

// app.use(mount('/graphql', graphql_http({ schema: MyGraphQLSchema })))

global.api = {}

for (let method of ['get', 'put', 'patch', 'post', 'delete'])
{
	global.api[method] = function(path, action)
	{
		router[method](path, function*(next)
		{
			const result = action({ ...this.request.body, ...this.query, ...this.params })

			if (result instanceof Promise)
			{
				yield result.then(result =>
				{
					this.body = result
				},
				error =>
				{
					throw error
				})
			}
			else
			{
				this.body = result
			}
		})
	}
}

for (let file of fs.readdirSync(path.join(__dirname, 'api')))
{
	// fs.statSync(path).isDirectory()

	log.info('loading api module', file)
	require(path.join(__dirname, 'api', file))
}

// https://github.com/alexmingoia/koa-router
web
	.use(router.routes())
	.use(router.allowedMethods())

global.Errors =
{
	Syntax_error  : custom_error('Syntax error',  { code: 400 }),
	Unauthorized  : custom_error('Unauthorized',  { code: 401 }),
	Access_denied : custom_error('Access denied', { code: 403 }),
	Not_found     : custom_error('Not found',     { code: 404 }),
	Input_missing : custom_error('Missing input', { code: 422 })
}

web.use(function*()
{
	// throw new Method_not_found()
	this.status = 404
	this.message = `Api method not found: ${this.method} "${this.path}"`
	
	log.error(this.message)
})

web.listen(configuration.api_server.http.port, (error) =>
{
	if (error)
	{
		return log.error(error)
	}

	log.info(`Api server is listening at http://${configuration.api_server.http.host}:${configuration.api_server.http.port}`)
})

// web.on('error', function(error, context)
// {
// 	log.error(error, context)
// })