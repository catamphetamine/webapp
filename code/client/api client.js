import superagent from 'superagent'

const sort_by_id = (a, b) => a.id - b.id

/*
 * This silly underscore is here to avoid a mysterious "ReferenceError: ApiClient is not defined" error.
 * See Issue #14. https://github.com/erikras/react-redux-universal-hot-example/issues/14
 *
 * Remove it at your own risk.
 */
class ApiClient_
{
	id = 1

	constructor(initial_server_http_request)
	{
		['get', 'post', 'put', 'patch', 'del'].
			forEach((method) =>
			{
				this[method] = (options) =>
				{
					if (method == 'post')
					{
						options = { data: options }
					}

					const url = this.formatUrl('/')
					return new Promise((resolve, reject) =>
					{
						let request = superagent[method](url)
						if (options && options.params)
						{
							request.query(options.params)
						}
						if (_server_)
						{
							if (initial_server_http_request.get('cookie'))
							{
								request.set('cookie', initial_server_http_request.get('cookie'))
							}
						}
						if (options && options.locale)
						{
							request.set('accept-language', locale)
						}
						if (options && options.data)
						{
							request.send(options.data)
						}
						request.end((error, response) => 
						{
							if (error)
							{
								reject(response.body || error)
							}
							else
							{
								resolve(response.body)
							}
						})
					})
				}
			})
	}

	// Вызвать метод API
	call(method, parameters, options)
	{
		const request = this.request_json(method, parameters)

		// if (this.batch)
		// {
		// 	return new Promise((resolve, reject) =>
		// 	{
		// 		this.batch.push(request)
		// 		this.batch_promises.push({ resolve: resolve, reject: reject })
		// 	})
		// }

		return this.request(request, options)
	}
	
	request_json(method, parameters)
	{
		const request = 
		{
			jsonrpc  : "2.0",
			id       : this.id++,
			method   : method,
			params   : parameters || {}
		}

		return request
	}

	request(request, options)
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

		return this.send(request, { minor: options.minor })
	}

	send(request, options)
	{
		return new Promise((resolve, reject) =>
		{
			const process_result = (response, promise) =>
			{
				// Если ошибка - показать сообщение и отменить Promise
				if (response.error)
				{
					// if this.is_not_authorized(response)
					//	 return this.wait_for_login(request)

					this.handle_error(request, response)
					throw new Api_error(response.error)
				}

				// Если нет ошибки - завершить Promise
				promise.resolve(response.result)
				return response.result
			}

			const batch_promises = this.batch_promises || []
			this.batch_promises = null

			this.post(request).then((response) =>
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
			},
			error =>
			{
				console.log('$$$$$$$$$$$$$$$$$')
				console.log(error)

				for (let promise of batch_promises)
				{
					promise.reject(error)
				}

				reject(error)
			})
		})
	}

	handle_error(request, response)
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
	}

	print_request(request)
	{
		if (Object.keys(request.params).not_empty())
		{
			console.log(`→ ${request.id} ${request.method}`, request.params)
		}
		else
		{
			console.log(`→ ${request.id} ${request.method}`)
		}
	}

	print_response(response)
	{
		console.log(`← ${response.id} ${response.method}`, response.error || response.result)
	}

	/* This was originally a standalone function outside of this class, but babel kept breaking, and this fixes it  */
	formatUrl(path)
	{
		// let adjustedPath = path[0] !== '/' ? '/' + path : path
		let adjustedPath = path
		if (_server_)
		{
			// Prepend host and port of the API server to the path.
			return `http://${configuration.api_server.http.host}:${configuration.api_server.http.port}${adjustedPath}`
		}
		// Prepend `/api` to relative URL, to proxy to API server.
		return `/api${adjustedPath}`
	}
}

const ApiClient = ApiClient_

export default ApiClient