import koa           from 'koa'

// import session       from 'koa-generic-session'
// import redis_store   from 'koa-redis'

// forked from the original repo as of 25.01.2016
// https://github.com/halt-hammerzeit/generic-session
import session       from './koa-generic-session'
// forked from the original repo as of 25.01.2016
// https://github.com/halt-hammerzeit/koa-redis
import redis_store   from './koa-redis'

import redis from 'redis'
import uid   from 'uid-safe'

Promise.promisifyAll(redis)

// import jwt from 'koa-jwt'

import jwt from 'jsonwebtoken'

// Promise.promisifyAll(jwt)

import body_parser   from 'koa-bodyparser'
import mount         from 'koa-mount'
import graphql_http  from 'koa-graphql'
import koa_router    from 'koa-router'
import koa_logger    from 'koa-bunyan'
import compress      from 'koa-compress'
import statics       from 'koa-static'
import koa_locale    from 'koa-locale'
import koa_proxy     from 'koa-proxy'
import busboy        from 'co-busboy'

import path from 'path'
import fs   from 'fs-extra'

import http  from 'http'
import https from 'https'

import http_client from './http'

// Sets up a Web Server instance (based on Koa)
//
// options:
//
// compress            - tar/gz response data
//
// extract_locale      - extracts locale from Http Request headers 
//                       and places it into this.locale
//
// session             - tracks user session (this.session)
//
// authentication      - uses a JWT token as a means of user authentication
//
// parse_post_requests - parse Http Post requests body
//
// routing             - enables Rest Http routing
//                       (usage: web.get('/path', parameters => return 'Echo'))
//
// log                 - bunyan log instance
//
// csrf                - enables protection against Cross Site Request Forgery attacks
//                       (pending)
//
// returns an object with properties:
//
//   shut_down()   - gracefully shuts down the server (pending)
//
//   connections() - returns currently open connections count (not tested)
//
//   errors        - a set of common Http errors
//
//     Unauthorized
//     Access_denied
//     Not_found
//     Input_missing
//
//   file_upload() - enables file upload functionality
//
//     parameters:
//
//       path           - the URL path to mount this middleware at (defaults to /)
//
//       output_folder  - where to write the files
//
//       root_folder    - Http response will contain file_name (or file_names) 
//                        relative to this folder
//
//       multiple_files - set this flag to true in case of multiple file upload
//
//   serve_static_files() - enables serving static files
//
//     parameters:
//
//       url_path        - the URL path to mount this middleware at
//
//       filesystem_path - the corresponding filesystem path where the static files reside
//
//   listen()             - starts listening for requests
//
//     parameters:
//
//       port - the TCP port to listen on
//       host - the TCP host to listen on (defaults to 0.0.0.0)
//
//     returns: a Promise
//
//   mount()             - mounts a middleware at a path
//
//     parameters:
//
//       path       - the URL path to mount the middleware at
//       middleware - the middleware to mount
//
//   use()               - standard Koa .use() method
//
//   proxy()             - proxies all requests for this path to another web server
//
//     parameters:
//
//       path        - the URL path to mount the requests for
//       destination - where to proxy these requests to
//
export default function web_server(options = {})
{
	// this object will be returned
	const result = {}

	// instantiate a Koa web application
	const web = koa()

	if (options.compress)
	{
		// хз, нужно ли сжатие в node.js: мб лучше поставить впереди nginx'ы, 
		// и ими сжимать, чтобы не нагружать процесс node.js
		web.use(compress())
	}

	if (options.log)
	{
		web.use(koa_logger(log,
		{
			// which level you want to use for logging.
			// default is info
			level: 'debug',
			// this is optional. Here you can provide request time in ms,
			// and all requests longer than specified time will have level 'warn'
			timeLimit: 100
		}))
	}

	if (options.extract_locale)
	{
		// get locale from Http request
		// (the second parameter is the Http Get parameter name)
		koa_locale(web, 'locale')

		// usage:
		//
		// .use(function*()
		// {
		// 	const preferred_locale = this.getLocaleFromQuery() || this.getLocaleFromCookie() || this.getLocaleFromHeader() || 'en'
		// })
	}

	// Set up session middleware
	web.keys = configuration.session_secret_keys

	if (options.authentication)
	{
		// web.use(jwt
		// ({
		// 	secret      : 'shared-secret',
		// 	passthrough : true,
		// 	key         : 'authentication',
		// 	cookie      : 'authentication'
		// }))

		function get_jwt_token(context)
		{
			let token = context.cookies.get('authentication')

			if (token)
			{
				return { token }
			}

			if (context.header.authorization)
			{
				const parts = context.header.authorization.split(' ')

				if (parts.length !== 2)
				{
					return { error: 'Bad Authorization header format. Format is "Authorization: Bearer <token>"' }
				}

				const scheme      = parts[0]
				const credentials = parts[1]

				if (!/^Bearer$/i.test(scheme))
				{
					return { error: 'Bad Authorization header format (scheme). Format is "Authorization: Bearer <token>"' }
				}

				return { token: credentials }
			}

			return { error: 'JWT token not found' }
		}

		function validate_jwt_id(jwt_id, user_id)
		{
			return http_client.get
			({
				host : configuration.authentication_service.http.host,
				port : configuration.authentication_service.http.port,
				path : '/validate_token'
			},
			{
				token_id: jwt_id,
				user_id
			})
		}

		async function authenticate()
		{
			const { token, error } = get_jwt_token(this)

			if (!token)
			{
				this.authentication_error = new result.errors.Unauthenticated(error)
				return
			}

			let payload

			for (let secret of web.keys)
			{
				try
				{
					payload = jwt.verify(token, secret)
					break
				}
				catch (error)
				{
					if (!error.name === 'JsonWebTokenError')
					{
						throw error
					}
				}
			}

			if (!payload)
			{
				this.authentication_error = new result.errors.Unauthenticated('Corrupt token')
				return
			}

			const jwt_id = payload.jti

			// subject
			const user_id = payload.sub

			if (!this.validating_jwt_id)
			{
				this.validating_jwt_id = validate_jwt_id(jwt_id, user_id)
			}

			const is_valid = (await this.validating_jwt_id).valid

			delete this.validating_jwt_id

			if (!is_valid)
			{
				this.authentication_error = new result.errors.Unauthenticated('Token revoked')
				return
			}

			this.jwt_id = jwt_id

			this.user = { id: user_id }
		}

		web.use(function*(next)
		{
			yield authenticate.bind(this)()
			yield next
		})
	}

	if (options.session)
	{
		const ttl = 15 * 60 * 1000 // 15 minutes // session timeout, in seconds

		if (configuration.redis)
		{
			const redis_client = redis.createClient
			({
				host      : configuration.redis.host,
				port      : configuration.redis.port,
				auth_pass : configuration.redis.password // auth_pass
			})

			const prefix = 'user:session:'

			function generate_id()
			{
				return uid.sync(24) // 24 is "byte length"; string length is 32 symbols
			}

			async function is_unique(id)
			{
				return !(await redis_client.existsAsync(prefix + id))
			}

			async function generate_unique_id()
			{
				const id = generate_id()
				if (await is_unique(id))
				{
					return id
				}
				return generate_unique_id()
			}

			web.use(session
			({
				key    : 'session:id',
				prefix,
				cookie :
				{
					maxAge : ttl
				},
				ttl, 
				genSid : generate_unique_id,
				store  : redis_store
				({
					client : redis_client
				})
			}))
		}
		else
		{
			web.use(session
			({
				key: 'session:id',
				// ttl,
				cookie :
				{
					maxAge : ttl
				},
			}))
		}
	}

	if (options.parse_post_requests)
	{
		// Set up http post request handling.
		// Usage: this.request.body
		web.use(body_parser({ formLimit: '100mb' }))
	}

	if (options.csrf)
	{
		// Cross Site Request Forgery protection
		//
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
	}

	// handle errors
	web.use(function*(next)
	{
		try
		{
			yield next
		}
		catch (error)
		{
			// log the error
			if (!exists(error.code))
			{
				log.error(error)
			}

			this.status = typeof error.code === 'number' ? error.code : 500
			this.message = error.message || 'Internal error'
		}
	})

	if (options.routing)
	{
		const router = koa_router()

		// supports routing
		//
		// usage: web.get('/path', parameters => 'Echo')
		for (let method of ['get', 'put', 'patch', 'post', 'delete'])
		{
			// if (web[method])
			// {
			// 	throw new Error(`Method web.${method}() already exists in this Koa application instance. Cannot override.`)
			// }

			result[method] = function(path, action)
			{
				router[method](path, function*(next)
				{
					const session = this.session
					const session_id = this.sessionId
					const destroy_session = () => this.session = null

					const get_cookie = name => this.cookies.get(name)
					const set_cookie = (name, value, options) => this.cookies.set(name, value, options)
					const destroy_cookie = name =>
					{
						this.cookies.set(name, null)
						this.cookies.set(name + '.sig', null)
					}

					const result = action({ ...this.request.body, ...this.query, ...this.params },
					{
						ip: this.ip,
						
						get_cookie,
						set_cookie,
						destroy_cookie,

						session,
						session_id,
						destroy_session,

						user                    : this.user,
						authentication_error    : this.authentication_error,
						authentication_token_id : this.jwt_id,

						keys : web.keys
					})

					// http://habrahabr.ru/company/yandex/blog/265569/
					switch (method)
					{
						case 'delete':
							this.status = 204 // nothing to be returned
					}

					function postprocess(result)
					{
						if (!exists(result))
						{
							return {}
						}

						if (!is_object(result) && !Array.isArray(result))
						{
							return { result }
						}

						return result
					}

					if (result instanceof Promise)
					{
						yield result.then(result =>
						{
							this.body = postprocess(result)
						},
						error =>
						{
							throw error
						})
					}
					else
					{
						this.body = postprocess(result)
					}
				})
			}
		}

		web.use(router.routes()).use(router.allowedMethods())
	}

	// server shutting down flag
	let shut_down = false

	// in case of maintenance
	web.use(function*(next)
	{
		if (shut_down)
		{
			this.status = 503
			this.message = 'The server is shutting down for maintenance'
		}
		else
		{
			yield next
		}
	})

	result.shut_down = function()
	{
		shut_down = true
	}

	let connections = 0

	result.connections = function()
	{
		return connections
	}

	// // log all errors
	// web.on('error', function(error, context)
	// {
	// 	log.error(error, context)
	// })

	// if (web.file_upload)
	// {
	// 	throw new Error(`Method web.file_upload() already exists in this Koa application instance. Cannot override.`)
	// }
	
	// can handle file uploads
	result.file_upload = function({ path = '/', output_folder, root_folder, multiple_files = false })
	{
		web.use(mount(path, file_upload_middleware(output_folder, root_folder, multiple_files, options.log)))
	}

	// if (web.errors)
	// {
	// 	throw new Error(`Variable web.errors already exists in this Koa application instance. Cannot override.`)
	// }

	// standard Http errors
	result.errors = 
	{
		Unauthenticated : custom_error('Unauthenticated', { code: 401 }),
		Unauthorized    : custom_error('Unauthorized',    { code: 403 }),
		Access_denied   : custom_error('Access denied',   { code: 403 }),
		Not_found       : custom_error('Not found',       { code: 404 }),
		Input_missing   : custom_error('Missing input',   { code: 400 }),
		Generic         : custom_error('Server error',    { code: 500 })
	}

	// can serve static files
	result.serve_static_files = function(url_path, filesystem_path)
	{
		// https://github.com/koajs/static
		web.use(mount(url_path, statics(filesystem_path, 
		{
			maxAge  : 365 * 24 * 60 * 60 // 1 year
		})))
	}

	// runs http server
	result.listen = (port, host = '0.0.0.0') =>
	{
		return new Promise((resolve, reject) =>
		{
			// the last route - throws not found error
			web.use(function*()
			{
				// throw new Method_not_found()
				this.status = 404
				this.message = `The requested resource not found: ${this.method} ${this.url}`
				
				if (this.path !== '/favicon.ico')
				{
					log.error(this.message)
				}
			})

			// http server
			const http_web_server = http.createServer()

			// // enable Koa for handling http requests
			// http_web_server.on('request', web.callback())

			// copy-pasted from 
			// https://github.com/koajs/koala/blob/master/lib/app.js
			//
			// "Expect: 100-continue" is something related to http request body parsing
			// http://crypto.pp.ua/2011/02/mexanizm-expectcontinue/
			//
			const koa_callback = web.callback()
			http_web_server.on('request', koa_callback)
			http_web_server.on('checkContinue', function(request, response)
			{
				// requests with `Expect: 100-continue`
				request.checkContinue = true
				koa_callback(request, response)
			})

			http_web_server.listen(port, host, error =>
			{
				if (error)
				{
					return reject(error)
				}

				resolve()
			})
			.on('connection', () => connections++)
			.on('close', () => connections--)
		})
	}

	// mounts middleware at path
	result.mount = (path, handler) =>
	{
		web.use(mount(path, handler))
	}

	// exposes Koa .use() function for custom middleware
	result.use = web.use.bind(web)

	// can proxy http requests
	result.proxy = (from, to) =>
	{
		if (exists(to))
		{
			web.use(mount(from, koa_proxy({ host: to })))
		}
		else
		{
			to = from
			web.use(koa_proxy({ host: to }))
		}
	}

	// done
	return result
}

// handles file upload
function file_upload_middleware(output_folder, root_folder, multiple_files, log)
{
	return function*(next)
	{
		if (!this.is('multipart/form-data'))
		{
			const error = new Error(`This is supposed to be a "multipart/form-data" http request`)
			error.code = 404
			throw error
		}

		function generate_unique_filename(folder)
		{
			return new Promise((resolve, reject) =>
			{
				const file_name = Math.random().toString().slice(2)

				fs.existsAsync(path.join(folder, file_name)).then(exists =>
				{
					resolve(file_name)
				},
				error =>
				{
					reject(error)
				})
			})
		}

		const files = busboy(this)

		const file_names = []

		let file

		while (file = yield files)
		{
			if (log)
			{
				log.debug(`Uploading: ${file.filename}`)
			}

			if (!multiple_files && file_names.not_empty())
			{
				throw new Error(`Multiple files are being uploaded to a single file upload endpoint`)
			}
				
			const file_name = yield generate_unique_filename(output_folder)
			const output_file = path.join(output_folder, file_name)

			yield new Promise((resolve, reject) =>
			{
				const stream = fs.createOutputStream(output_file)
				file.pipe(stream).on('finish', function()
				{
					resolve(path.relative(root_folder, output_file))
				})
				.on('error', function(error)
				{
					reject(error)
				})
			})
			.then(path =>
			{
				file_names.push(file_name)
			})
		}

		if (multiple_files)
		{
			return this.body = { file_names: file_names }
		}
		else
		{
			return this.body = { file_name: file_names[0] }
		}
	}
}