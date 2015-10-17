import koa          from 'koa'
import session      from 'koa-session'
import body_parser  from 'koa-bodyparser'
import mount        from 'koa-mount'
import graphql_http from 'koa-graphql'
import koa_router   from 'koa-router'

import configuration from '../configuration'
global.configuration = configuration

// import json_rpc      from './json rpc'

import log           from './log'

import path from 'path'
import fs   from 'fs'

// json_rpc.add('utility', utility)

const web = koa()

const router = koa_router()

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

		this.status = error.status || 500
		this.body = 'Internal error'
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
			const result = action()

			if (result instanceof Promise)
			{
				return result.then(result =>
				{
					this.body = result
				},
				error =>
				{
					throw error
				})
			}

			this.body = result
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

// const api_methods = {}

// for (let action of Object.keys(actions))
// {
// 	if (action === '__esModule')
// 	{
// 		continue
// 	}

// 	for (let method of Object.keys(actions[action]))
// 	{
// 		api_methods['/' + action + '/' + method] = actions[action][method]
// 	}
// }

// function find_api_method_by_path(path, request_path, http_method)
// {
// 	// request_path is used later to get parameters from the initial Url
// 	if (!http_method)
// 	{
// 		http_method = request_path
// 		request_path = path
// 	}

// 	// find api method by path
// 	let action = api_methods[path]

// 	// api method not found - trim the path and try again
// 	if (!action)
// 	{
// 		const slash_index = path.lastIndexOf('/')
// 		if (slash_index === 0)
// 		{
// 			return
// 		}

// 		return find_api_method_by_path(path.substring(0, slash_index - 1), request_path, http_method)
// 	}

// 	if (typeof action !== 'function')
// 	{
// 		switch (http_method)
// 		{
// 			case 'get':
// 				// find api method by path
// 				action = action.get
// 				break

// 			case 'post':
// 				// find api method by path
// 				action = action.create || action.call
// 				break

// 			case 'put':
// 				// find api method by path
// 				action = action.update
// 				break

// 			case 'delete':
// 				action = action.delete
// 				break
// 		}
// 	}

// 	// if api method not found
// 	if (typeof action !== 'function')
// 	{
// 		return
// 	}

// 	// extract parameters from the other part of the path
// 	let parameters = request_path
// 		.slice(path.length)
// 		.split('/')
// 		.filter(part => part != '')

// 	// make parameters either into a single parameter or into a hash object
// 	if (parameters.length === 0)
// 	{
// 		parameters = undefined
// 	}
// 	else if (parameters.length === 1)
// 	{
// 		parameters = parameters.first()
// 	}
// 	else
// 	{
// 		let key
// 		let values = {}

// 		for (let part in parameters)
// 		{
// 			if (exists(key))
// 			{
// 				values[key] = part
// 				key = undefined
// 			}
// 			else if (typeof part === 'string')
// 			{
// 				key = part
// 			}
// 		}

// 		parameters = values
// 	}

// 	// done
// 	return { action, parameters }
// }

// const Method_not_found = custom_error('Method_not_found')

// function api()
// {
// 	return new Promise((resolve, reject) =>
// 	{
// 		web.use(mount('/', function*()
// 		{
// 			const result = find_api_method_by_path(this.path, this.method.toLowerCase())

// 			if (!result)
// 			{
// 				// throw new Method_not_found()
// 				this.status = 404
// 				this.message = `Api method not found: ${this.method} "${this.path}"`
				
// 				log.error(this.message)
// 				return
// 			}

// 			const { action, parameters } = result

// 			yield action(parameters, this.body)
// 			.then(result =>
// 			{
// 				this.body = result
// 			},
// 			error =>
// 			{
// 				if (error && error.redirect)
// 				{
// 					return this.redirect(error.redirect)
// 				}

// 				throw error
// 			})
// 		}))

// 		web.listen(configuration.api_server.http.port, (error) =>
// 		{
// 			if (error)
// 			{
// 				return reject(error)
// 			}

// 			resolve()
// 		})
// 	})
// }

web.use(function*()
{
	// throw new Method_not_found()
	this.status = 404
	this.message = `Api method not found: ${this.method} "${this.path}"`
	
	log.error(this.message)
	return true
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