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

// KeyGrip keys, newest first
web.keys = configuration.session_secret_keys
web.use(session(web))

// также: в api client'е при любом запросе выставлять заголовок X-Csrf-Token = csrf token cookie.
//
// // Cross Site Request Forgery token check
// web.use(function* (next)
// {
// 	// on login:
// 	import crypto from 'crypto'
// 	const hmac = crypto.createHmac('sha1', configuration.session_secret_keys.first())
// 	hmac.update(this.session)
// 	this.cookies.set('csrf-token', hmac.digest('hex'))
//
// 	// else, if logged in
// 	if (this.get('X-Csrf-Token') !== this.cookies.get('csrf-token'))
// 	{
// 			throw new Errors.Access_denied(`Cross Site Request Forgery token mismatch. Expected "csrf-token" cookie value ${this.cookies.get('csrf-token')} to equal "X-Csrf-Token" header value ${this.get('X-Csrf-Token')}`)
// 	}
// })

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

			// http://habrahabr.ru/company/yandex/blog/265569/
			switch (method)
			{
				case 'delete':
					this.status = 204 // nothing to be returned
			}

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
	Unauthorized  : custom_error('Unauthorized',  { code: 403 }),
	Access_denied : custom_error('Access denied', { code: 403 }),
	Not_found     : custom_error('Not found',     { code: 404 }),
	Input_missing : custom_error('Missing input', { code: 400 })
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