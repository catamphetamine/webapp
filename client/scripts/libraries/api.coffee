# копипаста кода с работы.
# можно будет переписывать более красиво.
# мб написано не идеально, но вроде бы работает.
#
# Примеры использования:
#
# Json Rpc:
# api.call('module.action', { parameter: 123 }).then((result) -> ...).catch((error) -> ...)
#
# Json Rpc batching:
#
# api.begin()
#
# api.call('module.action', { parameter: 123 }).then((result) -> ...).catch((error) -> ...)
# api.call('module.action', { parameter: 123 }).then((result) -> ...).catch((error) -> ...)
#
# api.end().then((results_array) -> ...).catch((error) -> ...)

transports = 
  ajax:
    initialize: ->

    send: (request) ->
      ajax = require './ajax'
      ajax.post('/api', request)

  # websocket не обеспечивает гарантий доставки
  # http://stackoverflow.com/questions/20685208/websocket-transport-reliability-socket-io-data-loss-during-reconnection
  websocket:
    pending: {}

    # ready: no
    # when_ready: []

    initialize: ->
      websockets = require 'socket.io-client'

      # options =
      #   # key: fs.readFileSync('test/fixtures/client.key')
      #   # cert: fs.readFileSync('test/fixtures/client.crt')
      #   # ca: fs.readFileSync('test/fixtures/ca.crt')
      #   # path: '/websocket.io'

      # есть вероятность, что при использовании webpack-dev-server
      # websocket'ы не закрываются при обновлении страницы,
      # или ещё какой-то глюк
      @websocket = websockets("ws://#{_websocket_url_}/api")

      first_connection = yes

      @websocket.on 'connect', (socket) =>
        console.log('websocket connected')

        # @ready = yes
        # for request in @when_ready
        #   @websocket.emit('call', request)
        # @when_ready = []

        if first_connection
          @websocket.on 'return', (data) =>
            @pending[data.id].resolve(data)
            delete @pending[data.id]

          first_connection = no

      @websocket.on 'disconnect', (socket) =>
        console.log('websocket disconnected')
        console.log('emit')
        @websocket.emit('call', { id: 111, jsonrpc: '2.0', method: 'utility.settings', params: {}})

        new Promise (resolve, reject) =>
          @pending[111] = 
            resolve: resolve
            reject: reject

      @websocket.on 'reconnect_failed', => 
        console.log('reconnect_failed')
        for id, pending of @pending
          pending.reject('reconnect_failed')
        @pending = {}

    send: (request) ->
      # if @ready
      @websocket.emit('call', request)
      # else
      #   @when_ready.push(request)

      new Promise (resolve, reject) =>
        @pending[request.id] = 
          resolve: resolve
          reject: reject
      # .timeout(milliseconds)

# websocket не обеспечивает гарантий доставки
# http://stackoverflow.com/questions/20685208/websocket-transport-reliability-socket-io-data-loss-during-reconnection
# transport = transports.websocket
transport = transports.ajax
transport.initialize()

id = 1

sort_by_id = (a, b) -> a.id - b.id

class Api_error
	constructor: (@error) ->

api = 

	Api_error: Api_error
	 
	# Json Rpc batching
	begin: ->
		@batch = []
		@batch_promises = []

	end: ->
		if not @batch?
			throw new Error('Batch.end() called without batch.begin()')

		request = @batch
		@batch = null
		@request(request)

	request_json: (method, params) ->
		request = 
			id			: id++
			jsonrpc : "2.0"
			method	: method
			params	: params || {}

	# Вызвать метод API
	call: (method, params, options) ->
		request = @request_json(method, params)

		if @batch
			return new Promise (resolve, reject) ->
  			@batch.push(request)
  			@batch_promises.push({ resolve: resolve, reject: reject })

		return @request(request, options)

	request: (request, options) ->
		options = options || {}

		# вывести в консоль вызовы методов
		if request instanceof Array
			if request.is_empty()
				# self resolving promise
        return Promise.resolve(yes)

			request.sort(sort_by_id)

			# такое тормозит в консоли
			# request.forEach(function(item) {
			#	 if (!options.minor) {
			#		 console.log("→", item)
			#	 }
			# })

			# такое не тормозит в консоли
			if request.length == 1
				console.log("→", request[0])
			else
				console.log("→", request)
		else
			if not options.minor
				console.log("→", request)

		api.post(request, { minor: options.minor })

	# POST
	post: (request, options) ->

		new Promise (resolve, reject) ->

  		process_result = (response, promise) ->
  			# Если ошибка - показать сообщение и отменить Promise
  			if response.error
  				# if api.is_not_authorized(response)
  				#	 return api.wait_for_login(request)

  				api.handle_error(request, response)
  				throw new Api_error(response.error)

  			# Если нет ошибки - завершить Promise
  			promise.resolve(response.result)
  			return response.result

  		batch_promises = @batch_promises || []
  		@batch_promises = null

  		transport.send(request).then (response) ->

  			# если это не batch: сделать всё и выйти
  			if not (response instanceof Array)
  				# если запрос всё-таки был batch (хз, бывает ли такое)
  				if request instanceof Array
  					response = [response]
  				else
  					# иначе - просто ответ
  					if not options.minor
  						console.log("←", response)
  					try
  						return process_result(response, { resolve: resolve, reject: reject })
  					catch error
  						if not (error instanceof Api_error)
  							throw error

  						console.error('API error in request', request, 'response', response)

  						return reject(error.error)

  			# такое тормозит в консоли
  			# response.forEach(function(item) {
  			#	 if (!options.minor) {
  			#		 console.log("←", item)
  			#	 }
  			# })

  			response.sort(sort_by_id)

  			# такое не тормозит в консоли
  			if request.length == 1
  				console.log("←", response[0])
  			else
  				console.log("←", response)

  			result = []

  			failed = no

  			i = 0
  			while i < response.length
  				try 
  					result.push(process_result(response[i], batch_promises[i]))

  				catch error
  					if not (error instanceof Api_error)
  						throw error

  					if not failed
  						console.error('API error in request', request[i], 'response', response[i])
  						reject(error)
  						failed = yes

  				i++

  			if not failed
  				resolve(result)
  		
  		.catch (error) ->
  			for promise in batch_promises
  				promise.reject(error)

  			reject(error)

	# wait_for_login: (request) -> 
	#	 # здесь можно складывать куда-нибудь команды,
	#	 # которые не прошли из-за нелогина, и после логина их перепосылать,
	#	 # и возможно резолвить промисы, а не reject'ить их,
	#	 # если после логина эти команды прошли

	# is_not_authorized: (response) -> response.error.code == 401

	handle_error: (request, response) ->

		show = (message) ->
			# if path == "/login"
			#	 return alert(message)

			alert(message)

		switch response.error.code 

			# Не авторизованный доступ
			when 401
        alert('unauthenticated')

			# Forbidden
			when 403
				# Ошибка "неизвестная пара логин/пароль" обрабатывается явно на странице входа
				if not response.method == 'auth.auth'
					show(response.error.message)

			# Неверный формат запроса
			when 400
				show(response.error.message)

			# Прочее
			else
				message = response.error.message
				if response.error.code 
					message = response.method + ': ' + message
				show(message)

module.exports = api