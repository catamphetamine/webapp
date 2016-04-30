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

import file_size_parser from 'filesize-parser'

// import jwt from 'koa-jwt'

import jwt from 'jsonwebtoken'

// Promise.promisifyAll(jwt)

import http_proxy from 'http-proxy'

import body_parser   from 'koa-bodyparser'
import mount         from 'koa-mount'
import graphql_http  from 'koa-graphql'
import koa_router    from 'koa-router'
import koa_logger    from 'koa-bunyan'
import compress      from 'koa-compress'
import statics       from 'koa-static'
import koa_locale    from 'koa-locale'
import busboy        from 'co-busboy'

// doesn't work well with redirects, is an amateurish project
// import koa_proxy     from 'koa-proxy'

import path from 'path'
import fs   from 'fs-extra'

import http  from 'http'
import https from 'https'

import http_client from './http'

import render_stack_trace from './html stack trace'

// Sets up a Web Server instance (based on Koa)
//
// options:
//
// compress            - enables tar/gz compression of Http response data
//
// extract_locale      - extracts locale from Http Request headers 
//                       and places it into this.locale
//
// session             - tracks user session (this.session)
//
// authentication      - uses a JWT token as a means of user authentication
//                       (should be a function transforming token payload into user info)
//
// parse_body          - parse Http Post requests body (default: false; true when using routing)
//
// routing             - enables Rest Http routing
//                       (usage: web.get('/path', parameters => return 'Echo'))
//
// log                 - bunyan log instance
//
// csrf                - enables protection against Cross Site Request Forgery attacks
//                       (pending)
//
// secret              - gives access to app.keys[0] when using routing feature
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
//       upload_folder  - where to write the files
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

	// handle errors
	web.use(function*(next)
	{
		// generic errors for throwing
		// (for convenient access from the subsequent middlewares and Http request handlers)
		this.errors = result.errors

		try
		{
			// // measure Http request processing time
			// const key = `${this.host}${this.url}`

			// // started processing Http request
			// console.time(key)

			// try to respond to this Http request
			yield next

			// // finished processing Http request
			// console.timeEnd(key)
		}
		catch (error)
		{
			let http_status_code

			if (exists(error.http_status_code))
			{
				http_status_code = error.http_status_code
			}
			// superagent errors
			// https://github.com/visionmedia/superagent/blob/29ca1fc938b974c6623d9040a044e39dfb272fed/lib/node/response.js#L106
			else if (typeof error.status === 'number')
			{
				http_status_code = error.status
			}

			if (exists(http_status_code))
			{
				// set Http Response status code according to the error's `code`
				this.status = http_status_code

				// set Http Response text according to the error message
				this.body = error.message || 'Internal error'
			}
			else
			{
				// log the error, if it's not a normal Api error
				// (prevents log pollution with things like 
				//  `404 User not found` or `401 Not authenticated`)

				// if (error.proxy_error 
				// 	&& options.show_proxy_errors 
				// 	&& options.show_proxy_errors[error.proxy_to] === false)
				// {
				// 	// don't output error to the log
				// }
				// else
				// {
				// 	// for easier debugging
				// 	console.log('(http request failed)')
				// 	log.error(error)
				// }

				log.error(error, '(http request failed)')

				this.status = 500
				this.body = 'Internal error'
			}

			// show error stack trace in development mode for easier debugging
			if (_development_)
			{
				const { response_status, response_body } = render_stack_trace(error)

				if (response_body)
				{
					this.status = response_status || http_status_code || 500
					this.body = response_body
					this.type = 'html'

					return
				}
			}
		}
	})

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

	web.keys = configuration.session_secret_keys

	if (options.authentication === true)
	{
		options.authentication = configuration.authentication_token_payload.read || (() => ({}))
	}

	if (options.authentication)
	{
		const validate_token_url = '/validate-token'

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

		function validate_token(jwt, bot)
		{
			return http_client.get
			(
				`${address_book.authentication_service}${validate_token_url}`,
				{ bot },
				{ headers: { Authorization: `Bearer ${jwt}` } }
			)
		}

		// takes some milliseconds to finish
		// because it validates the token via an Http request
		// to the authentication service
		async function authenticate()
		{
			const { token, error } = get_jwt_token(this)

			this.authenticate = () => { throw new result.errors.Unauthenticated() }
			this.role         = () => { throw new result.errors.Unauthenticated() }

			if (!token)
			{
				this.authentication_error = new result.errors.Unauthenticated(error)
				return
			}

			this.jwt = token

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
					// if authentication token expired
					if (error.name === 'TokenExpiredError')
					{
						this.authentication_error = new result.errors.Unauthenticated('Token expired')
						return
					}

					// try another `secret`
					if (error.name === 'JsonWebTokenError')
					{
						continue
					}

					// some other error
					throw error					
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

			// validate token 
			// (for example, that it has not been revoked)
			if (this.path !== validate_token_url)
			{
				if (!this.validating_jwt_id)
				{
					this.validating_jwt_id = validate_token(token, this.query.bot)
				}

				// takes some milliseconds to finish
				//
				// validates the token via an Http request
				// to the authentication service
				const is_valid = (await this.validating_jwt_id).valid

				delete this.validating_jwt_id

				if (!is_valid)
				{
					this.authentication_error = new result.errors.Unauthenticated('Token revoked')
					return
				}
			}

			this.jwt_id = jwt_id

			this.user = options.authentication(payload)
			this.user.id = user_id
			
			// payload fields:
			//
			// 'iss' // Issuer
			// 'sub' // Subject
			// 'aud' // Audience
			// 'exp' // Expiration time
			// 'nbf' // Not before
			// 'iat' // Issued at 
			// 'jti' // JWT ID

			this.token_data = payload

			this.authenticate = () => this.user

			this.role = (...roles) =>
			{
				for (let role of roles)
				{
					if (this.user.role === role)
					{
						return true
					}
				}

				throw new result.errors.Unauthorized(`One of the following roles is required: ${roles}`)
			}
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

	if (options.parse_body !== false && options.routing === true)
	{
		options.parse_body = true
	}

	if (options.parse_body)
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
				// all errors thrown from this middleware will get caught 
				// by the error-catching middleware above
				router[method](path, function*(next)
				{
					const session = this.session
					const session_id = this.sessionId
					const destroy_session = () => this.session = null

					const get_cookie = name => this.cookies.get(name)
					
					const set_cookie = (name, value, options = {}) =>
					{
						// http://stackoverflow.com/questions/3290424/set-a-cookie-to-never-expire
						options.expires = options.expires || new Date(2147483647000)  // January 2038

						this.cookies.set(name, value, options)
					}

					const destroy_cookie = name =>
					{
						this.cookies.set(name, null)
						this.cookies.set(name + '.sig', null)
					}

					// api call parameters
					const parameters = { ...this.request.body, ...this.query, ...this.params }

					// treat empty strings as `undefined`s
					for (let key of Object.keys(parameters))
					{
						if (parameters[key] === '')
						{
							delete parameters[key]
						}
					}

					// add JWT header to http client requests
					
					let tokenized_http_client = http_client

					if (this.jwt)
					{
						tokenized_http_client = {}

						const jwt_header = `Bearer ${this.jwt}`

						for (let key of Object.keys(http_client))
						{
							tokenized_http_client[key] = function(destination, data, options)
							{
								options = options || {}
								options.headers = options.headers || {}
								options.headers.Authorization = options.headers.Authorization || jwt_header

								return http_client[key](destination, data, options)
							}
						}
					}

					// call the api method action
					const result = action.bind(this)(parameters,
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
						authentication_token    : this.jwt,

						secret : options.secret ? web.keys[0] : undefined,

						http : tokenized_http_client
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

					function is_redirect(result)
					{
						return is_object(result) && result.redirect && Object.keys(result).length === 1
					}

					const respond = result =>
					{
						if (is_redirect(result))
						{
							return this.redirect(result.redirect)
						}

						this.body = postprocess(result)
					}

					if (result instanceof Promise)
					{
						yield result.then
						(
							respond,
							error => { throw error }
						)
					}
					else
					{
						respond(result)
					}
				})
			}
		}

		if (typeof options.routing !== 'string')
		{
			if (!options.parse_body)
			{
				throw new Error(`"parse_body" was set to false and "routing" was set to true. Set "routing" to a path then.`)
			}

			web.use(router.routes())
				.use(router.allowedMethods())
		}
		else
		{
			web.use(mount(options.routing, body_parser({ formLimit: '100mb' })))
				.use(mount(options.routing, router.routes()))
				.use(mount(options.routing, router.allowedMethods()))
		}
	}

	// active Http proxy servers
	const proxies = []

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

		// pending promises
		const pending = []

		// shut down http proxy
		proxies.forEach(proxy => pending.push(proxy.closeAsync()))

		// Stops the server from accepting new connections and keeps existing connections. 
		//
		// The optional callback will be called once the 'close' event occurs. 
		// Unlike that event, it will be called with an Error as its only argument 
		// if the server was not open when it was closed.
		//
		pending.push(Promise.promisify(web.close, { context : web })())

		return Promise.all(pending)
	}

	result.connections = function()
	{
		// http_server.getConnections()
		return Promise.promisify(web.getConnections(), { context : web })()
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
	result.file_upload = function({ path = '/', upload_folder, requires_authentication = false, multiple_files = false, postprocess, file_size_limit })
	{
		if (options.parse_body)
		{
			throw new Error(`.file_upload() was enabled but also "parse_body" wasn't set to false, therefore Http POST request bodies are parsed which creates a conflict. Set "parse_body" parameter to false.`)
		}

		web.use(mount(path, function*()
		{
			if (!this.is('multipart/form-data'))
			{
				const error = new Error(`This is supposed to be a "multipart/form-data" http request`)
				error.code = 404
				throw error
			}

			if (requires_authentication !== false && !this.user)
			{
				throw new result.errors.Unauthenticated()
			}

			const file_names = []

			const form_data = busboy(this,
			{
				limits:
				{
					fileSize: file_size_limit ? file_size_parser(file_size_limit) : undefined
				}
			})

			const parameters = {}

			let form_data_item
			while (form_data_item = yield form_data)
			{
				if (!multiple_files && file_names.not_empty())
				{
					throw new Error(`Multiple files are being uploaded to a single file upload endpoint`)
				}

				if (Array.isArray(form_data_item))
				{
					parameters[form_data_item[0]] = form_data_item[1]
					continue
				}

				const file_name = yield upload_file(form_data_item, { upload_folder, log: options.log })

				file_names.push
				({
					original_file_name: form_data_item.filename,
					uploaded_file_name: file_name
				})
			}

			let result

			if (multiple_files)
			{
				result = { files: file_names, parameters }
			}
			else
			{
				result = { file: file_names[0], parameters }
			}

			if (postprocess)
			{
				result = yield postprocess.call(this, result)
			}

			this.body = result
		}))
	}

	// if (web.errors)
	// {
	// 	throw new Error(`Variable web.errors already exists in this Koa application instance. Cannot override.`)
	// }

	// standard Http errors
	result.errors = 
	{
		Unauthenticated : custom_error('Unauthenticated', { additional_properties: { http_status_code: 401 } }),
		Unauthorized    : custom_error('Unauthorized',    { additional_properties: { http_status_code: 403 } }),
		Access_denied   : custom_error('Access denied',   { additional_properties: { http_status_code: 403 } }),
		Not_found       : custom_error('Not found',       { additional_properties: { http_status_code: 404 } }),
		Input_missing   : custom_error('Missing input',   { additional_properties: { http_status_code: 400 } }),
		Error           : custom_error('Server error',    { additional_properties: { http_status_code: 500 } })
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
				
				if (!this.path.ends_with('/favicon.ico'))
				{
					log.error(this.message, 'Web server error: Not found')
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
			// .on('connection', () => connections++)
			// .on('close', () => connections--)
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
		if (!exists(to))
		{
			to = from
			from = undefined
		}

		const proxy = http_proxy.createProxyServer({})
		proxies.push(proxy)

		// proxy.closeAsync() is used when shutting down the web server
		Promise.promisifyAll(proxy)

		function proxy_middleware(to)
		{
			return function*(next)
			{
				const promise = new Promise((resolve, reject) =>
				{
					this.res.on('close', () =>
					{
						reject(new Error(`Http response closed while proxying ${this.url} to ${to}`))
					})

					this.res.on('finish', () =>
					{
						resolve()
					})

					// proxy.webAsync() won't work here,
					// because the last parameter is not a "callback",
					// it's just an error handler.
					// https://github.com/nodejitsu/node-http-proxy/issues/951
					proxy.web(this.req, this.res, { target: to }, error =>
					{
						// usually errors with "Parse error" which is useless

						// error.proxy_error = true
						// error.proxy_to = to

						console.error('Proxying failed')
						reject(error)
					})
				})

				yield promise
			}
		}

		if (from)
		{
			web.use(mount(from, proxy_middleware(to)))
		}
		else
		{
			web.use(proxy_middleware(to))
		}
	}

	// done
	return result
}

// checks if filesystem path exists
export function fs_exists(path)
{
	return new Promise((resolve, reject) => 
	{
		fs.exists(path, exists => resolve(exists))
	})
}

// generates a unique temporary file name
async function generate_unique_filename(folder, options)
{
	// 24 bytes
	let file_name = uid.sync(24)

	if (options.dot_extension)
	{
		file_name += options.dot_extension
	}

	const exists = await fs_exists(path.join(folder, file_name))

	if (!exists)
	{
		return file_name
	}

	if (options.log)
	{
		options.log.info(`Generate unique file name: collision for "${file_name}". Taking another try.`)
	}

	return await generate_unique_filename(folder, options)
}

// handles file upload
async function upload_file(file, { upload_folder, log })
{
	if (log)
	{
		log.debug(`Uploading: ${file.filename}`)
	}
		
	const file_name = await generate_unique_filename(upload_folder, { log }) // dot_extension: path.extname(file.filename), 
	const output_file = path.join(upload_folder, file_name)

	return await new Promise((resolve, reject) =>
	{
		const stream = fs.createOutputStream(output_file)

		file.pipe(stream)
			.on('finish', () => resolve(path.relative(upload_folder, output_file)))
			.on('error', error => reject(error))
	})
}