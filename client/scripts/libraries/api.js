// копипаста кода с работы.
// можно будет переписывать более красиво.
// мб написано не идеально, но вроде бы работает.
//
// Примеры использования:
//
// Json Rpc:
// api.call('module.action', { parameter: 123 }).then((result) -> ...).catch((error) -> ...)
//
// Json Rpc batching:
//
// api.begin()
//
// api.call('module.action', { parameter: 123 }).then((result) -> ...).catch((error) -> ...)
// api.call('module.action', { parameter: 123 }).then((result) -> ...).catch((error) -> ...)
//
// api.end().then((results_array) -> ...).catch((error) -> ...)

import ajax from './ajax'
import websockets from 'socket.io-client'

// используемая в приложении версия Api
const version = '1.0.0'

const transports = 
{
	ajax:
	{
		initialize: () => {},

		send: (request) =>
		{
			return ajax.post(`/api/v${version}`, request)
		}
	},

	// websocket не обеспечивает гарантий доставки
	// http://stackoverflow.com/questions/20685208/websocket-transport-reliability-socket-io-data-loss-during-reconnection
	websocket:
	{
		pending: {},

		// ready: no
		// when_ready: []

		initialize: function()
		{
			// options =
			//	 // key: fs.readFileSync('test/fixtures/client.key')
			//	 // cert: fs.readFileSync('test/fixtures/client.crt')
			//	 // ca: fs.readFileSync('test/fixtures/ca.crt')
			//	 // path: '/websocket.io'

			// есть вероятность, что при использовании webpack-dev-server
			// websocket'ы не закрываются при обновлении страницы,
			// или ещё какой-то глюк
			this.websocket = websockets(`ws://${_websocket_url_}/api`)

			let first_connection = true

			this.websocket.on('connect', (socket) =>
			{
				console.log('websocket connected')

				// this.ready = yes
				// for request in this.when_ready
				//	 this.websocket.emit('call', request)
				// this.when_ready = []

				if (first_connection)
				{
					this.websocket.on('return', (data) =>
					{
						this.pending[data.id].resolve(data)
						delete this.pending[data.id]
					})

					first_connection = false
				}
			})

			this.websocket.on('disconnect', socket =>
			{
				console.log('websocket disconnected')
			})

			this.websocket.on('reconnect_failed', () => 
			{
				console.log('reconnect_failed')
				for (let id of this.pending)
				{
					this.pending[id].reject('reconnect_failed')
				}
				this.pending = {}
			})
		},

		send: function(request)
		{
			// if this.ready
			this.websocket.emit('call', request)
			// else
			//	 this.when_ready.push(request)

			return new Promise((resolve, reject) =>
			{
				this.pending[request.id] = 
				{
					resolve: resolve,
					reject: reject
				}
			})
			// .timeout(milliseconds)
		}
	}
}

// websocket не обеспечивает гарантий доставки
// http://stackoverflow.com/questions/20685208/websocket-transport-reliability-socket-io-data-loss-during-reconnection
// transport = transports.websocket
const transport = transports.ajax
transport.initialize()

let id = 1

const sort_by_id = (a, b) => a.id - b.id

const api = 
{
	error: 
	{
		generic: custom_error('Api_error'),
		not_authenticated: custom_error('Not_authenticated')
	},

	is_api_error: (error) =>
	{
		for (let key of api.error)
		{
			if (error instanceof api.error[key])
			{
				return true
			}
		}
	},
				
	// Json Rpc batching
	begin: function()
	{
		this.batch = []
		this.batch_promises = []
	},

	end: function()
	{
		if (!exists(this.batch))
		{
			throw new Error('Batch.end() called without batch.begin()')
		}

		request = this.batch
		this.batch = null
		return this.request(request)
	},

	request_json: function(method, parameters)
	{
		const request = 
		{
			jsonrpc  : "2.0",
			id       : id++,
			method   : method,
			params   : parameters || {}
		}

		return request
	},

	// Вызвать метод API
	call: function(method, parameters, options)
	{
		const request = this.request_json(method, parameters)

		if (this.batch)
		{
			return new Promise((resolve, reject) =>
			{
				this.batch.push(request)
				this.batch_promises.push({ resolve: resolve, reject: reject })
			})
		}

		return this.request(request, options)
	},

	request: function(request, options)
	{
		options = options || {}

		// вывести в консоль вызовы методов
		if (request instanceof Array)
		{
			if (request.is_empty())
			{
				// self resolving promise
				return Promise.resolve(yes)
			}

			request.sort(sort_by_id)

			// такое тормозит в консоли
			// request.forEach(function(item) {
			//	 if (!options.minor) {
			//		 console.log("→", item)
			//	 }
			// })

			// такое не тормозит в консоли
			if (request.length == 1)
			{
				this.print_request(request[0])
			}
			else
			{
				this.print_request(request)
			}
		}
		else
		{
			if (!options.minor)
			{
				this.print_request(request)
			}
		}

		return api.send(request, { minor: options.minor })
	},

	send: function(request, options)
	{
		return new Promise((resolve, reject) =>
		{
			const process_result = (response, promise) =>
			{
				// Если ошибка - показать сообщение и отменить Promise
				if (response.error)
				{
					// if api.is_not_authorized(response)
					//	 return api.wait_for_login(request)

					api.handle_error(request, response)
					throw new Api_error(response.error)
				}

				// Если нет ошибки - завершить Promise
				promise.resolve(response.result)
				return response.result
			}

			const batch_promises = this.batch_promises || []
			this.batch_promises = null

			transport.send(request).then((response) =>
			{
				// если это не batch: сделать всё и выйти
				if (!(response instanceof Array))
				{
					// если запрос всё-таки был batch (хз, бывает ли такое)
					if (request instanceof Array)
					{
						response = [response]
					}
					else
					{
						// иначе - просто ответ
						if (!options.minor)
						{
							this.print_response(response)
						}

						try
						{
							return process_result(response, { resolve: resolve, reject: reject })
						}
						catch (error)
						{
							if (!(error instanceof Api_error))
							{
								throw error
							}

							console.error('API error in request', request, 'response', response)

							return reject(error.error)
						}
					}
				}

				// такое тормозит в консоли
				// response.forEach(function(item) {
				//	 if (!options.minor) {
				//		 console.log("←", item)
				//	 }
				// })

				response.sort(sort_by_id)

				// такое не тормозит в консоли
				if (request.length == 1)
				{
					this.print_response(response[0])
				}
				else
				{
					this.print_response(response)
				}

				const result = []

				let failed = no

				let i = 0
				while (i < response.length)
				{
					try 
					{
						result.push(process_result(response[i], batch_promises[i]))
					}
					catch (error)
					{
						if (!(error instanceof Api_error))
						{
							throw error
						}

						if (!failed)
						{
							console.error('API error in request', request[i], 'response', response[i])
							reject(error)
							failed = true
						}
					}

					i++
				}

				if (!failed)
				{
					resolve(result)
				}
			})
			.catch(error =>
			{
				for (let promise of batch_promises)
				{
					promise.reject(error)
				}

				reject(error)
			})
		})
	},

	// wait_for_login: (request) -> 
	// здесь можно складывать куда-нибудь команды,
	// которые не прошли из-за нелогина, и после логина их перепосылать,
	// и возможно резолвить промисы, а не reject'ить их,
	// если после логина эти команды прошли

	// is_not_authorized: (response) -> response.error.code == 401

	handle_error: function(request, response)
	{
		const show = (message) =>
		{
			// if path == "/login"
			//	 return alert(message)

			alert(message)
		}

		switch (response.error.code )
		{
			// Не авторизованный доступ
			case 401:
				show('unauthenticated')
				break

			// Forbidden
			case 403:
				// Ошибка "неизвестная пара логин/пароль" обрабатывается явно на странице входа
				if (response.method != 'auth.auth')
				{
					show(response.error.message)
				}
				break

			// Неверный формат запроса
			case 400:
				show(response.error.message)
				break

			// Прочее
			default:
				let message = response.error.message
				if (exists(response.error.code))
				{
					message = response.method + ': ' + message
				}
				show(message)
				break
		}
	},

	print_request: function(request)
	{
		if (Object.keys(request.params).not_empty())
		{
			console.log(`→ ${request.id} ${request.method}`, request.params)
		}
		else
		{
			console.log(`→ ${request.id} ${request.method}`)
		}
	},

	print_response: function(response)
	{
		console.log(`← ${response.id} ${response.method}`, response.error || response.result)
	}
}

export default api