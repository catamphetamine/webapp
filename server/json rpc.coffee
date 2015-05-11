# JSON RPC2

http = require 'http'
auth = require './api/auth'

# Заглушки для тестирования (autonomous_testing) проксируемых команд 
# без перенаправления на удалённый сервер
Stub = require './json rpc stub'
stub = new Stub

# Реализует взаимодействие по протоколу Json Rpc.
#
# batching - это запрос на выполнение нескольких Json Rpc команд за один раз;
# экономит время на Tcp latency: не нужно каждый раз заново соединяться 
# с сервером по Http для выполнения каждой команды.
#
# команды делятся на "внутренние" (реализованные этим приложением)
# и "внешние" (реализованные на удалённом сервере и посылаемые туда проксированием через себя)
#
# Примеры использования:
#
# Json_rpc('module.command', { parameter_x: 'x' }, (result) -> ...)
# Json_rpc('module.command', { parameter_x: 'x' }).pipe(http_response)
#
# Json_rpc({ ... }).then((result) -> ...)
# Json_rpc({ ... }).pipe(http_response)
#
# Json_rpc([{ ... }, { ... }]).then((result) -> ...)
# Json_rpc([{ ... }, { ... }]).pipe(http_response)
#
# Json_rpc(http_request).then((result) -> ...)
# Json_rpc(http_request).pipe(http_response)
#
# "Бекенд", на который проксируются Json Rpc запросы, настраивается в конфигурации:
# { ... backend: { host: ..., port: ... } ... }
class Json_rpc

	# стандартные ошибки протокола Json Rpc
	@errors:
		PARSE_ERROR      : {code: -32700, message: 'Parse error'}
		INVALID_REQUEST  : {code: -32600, message: 'Invalid request'}
		METHOD_NOT_FOUND : {code: -32601, message: 'Method not found'}
		INVALID_PARAMS   : {code: -32602, message: 'Invalid parameters'}
		INTERNAL_ERROR   : {code: -32603, message: 'Internal error'}
		_ERROR           : {code: -32001, message: 'Error not found in RPC module'}

	# здесь будут храниться "внутренние" команды Json Rpc, которые можно вызывать
	@methods: {}

	# вспомогательный метод, который можно вызывать с помощью .apply(@, arguments)
	@create: (argument_1, argument_2, argument_3) ->
		new Json_rpc(argument_1, argument_2, argument_3)

	constructor: (argument_1, argument_2, argument_3) ->

		# если это http request
		if argument_1 instanceof http.IncomingMessage

			http_request = argument_1

			session = http_request.session

			@authentication =
				authorize : (callback) ->         auth.auth(session, callback)
				login     : (params, callback) -> auth.login(params, session, callback)
				logout    : (callback) ->         auth.logout(session, callback)

			@json_rpc_request = http_request.body

		# иначе - это либо json rpc request, либо batch из них
		else if typeof argument_1 == 'string'
			method     = argument_1
			parameters = argument_2

			@json_rpc_request = Json_rpc.request(method, parameters)
		else
			@json_rpc_request = argument_1

	# возвращает Promise
	promise: ->
		return new Promise (resolve, reject) =>
			@execute_with_callback (result) ->

				# если это был batch
				if result instanceof Array

					# были ли ошибки
					errors = result.filter((x) -> x.error)

					if errors.not_empty()
						return reject(errors[0])

					return resolve(result.map((x) -> x.result))

				# если это была одиночная команда

				if typeof result == 'string'
					result = JSON.parse(result)

				# если была ошибка
				if result.error
					return reject(result.error)

				resolve(result.result)

	# тоже возвращает Promise
	then: (callback) ->
		@promise().then(callback)

	# выполнить Json rpc запрос, записав ответ в Http response
	pipe: (http_response) ->
		@respond = (json_rpc_result) -> 
			http_response.send(json_rpc_result)

		@proxy = => 
			# log.info 'Proxy', json_rpc_request
			# "проксировать" "по-сырому"
			Proxy.flow(@json_rpc_request, http_response)

		# вызвать основной обработчик Json_rpc
		@execute()

	# выполнить Json rpc запрос, возвратив ответ в callback'е 
	# (не таком, у которого первый аргумент - ошибка, а просто callback(result))
	execute_with_callback: (callback) ->
		@respond = (json_rpc_result) -> callback(json_rpc_result)

		@proxy = => 
			# проксировать Json Rpc запрос (не "по-сырому")
			Proxy.buffered(@json_rpc_request, @respond)

		# вызвать основной обработчик Json_rpc
		@execute()

	# обработчик входящего запроса на выполнение Json Rpc команды
	execute: ->
		# если это не batching - просто выполнить одну команду
		if not (@json_rpc_request instanceof Array)
			# если эта команда внутренняя (или если это режим autonomous_testing), то выполнить её
			if Json_rpc.has(@json_rpc_request.method) || configuration.autonomous_testing
				return @execute_command(@json_rpc_request, @respond)

			# если эта команда внешняя, проксировать её
			if @is_public()
				return @proxy()
			else
				return @authorize().and(@proxy)

		# если это batching - проверить, однороден ли набор команд.
		# если это только внешние команды - просто пропустить через себя сырой поток данных туда/сюда
		# (это более эффективно, т.к. не расходуется оперативная память на хранение данных всего набора команд)
		if Json_rpc.classify_batch(@json_rpc_request) == 'external'
			return @authorize().and(@proxy)

		# если же это внутренние или смешанные команды - выполнить каждую по одной
		# (с промежуточным хранением всех данных в оперативной памяти)

		# здесь будут храниться результаты выполнения каждой Json Rpc команды
		batch_result = []

		json_rpc_requests = @json_rpc_request.clone()

		# respond с обратным отсчётом
		respond = (result) =>
			# если результат выполнения Json Rpc команды - строка, то преобразовать в Json
			if typeof result == 'string'
				result = JSON.parse(result)
			
			# добавить в ответ
			batch_result.push(result)

			# выполнить очередную Json Rpc команду
			return next() if has_next()
			
			# если все ответы получены - отослать ответ по Http
			@respond(batch_result)

		# выполнить очередную Json Rpc команду

		has_next = -> json_rpc_requests.not_empty()

		next = =>
			if not has_next()
				throw new Error('No more commands in batch')

			json_rpc_request = json_rpc_requests.shift()

			# если эта команда внутренняя (или если это режим autonomous_testing), то выполнить её
			if Json_rpc.has(json_rpc_request.method) || configuration.autonomous_testing
				@execute_command(json_rpc_request, respond)
			# если эта команда внешняя, проксировать её
			else
				@authorize().and -> 
					# проксировать Json Rpc запрос (не "по-сырому")
					Proxy.buffered(json_rpc_request, respond)

		next()

	is_public: (json_rpc_request) ->
		json_rpc_request = json_rpc_request || @json_rpc_request

		switch json_rpc_request.method
			when 'getSwitchInfo' then yes

	authorize: (respond, json_rpc_request) ->
		respond          = respond || @respond
		json_rpc_request = json_rpc_request || @json_rpc_request

		promise = new Promise (resolve, reject) =>

			return resolve() if not @authentication?

			@authentication.authorize (error) ->

				# если пользователь не авторизован
				if error
					return reject(error)

				resolve()

		return {
			and: (action) ->
				promise.then(action).catch (error) ->
					respond(Json_rpc.error(error, json_rpc_request))
		}

	# выполнить (внутреннюю) Json Rpc команду
	execute_command: (json_rpc_request, respond) ->

		method = json_rpc_request.method
		params = json_rpc_request.params

		log.debug('--', method)

		callback = Json_rpc.callback(respond, json_rpc_request)

		if not Json_rpc.validate(json_rpc_request)
			return callback(Json_rpc.errors.INVALID_REQUEST)

		# если добавляете сюда метод - добавьте его также в Json_rpc.has
		switch method
			when 'auth.auth'   then return @authentication.authorize(callback)
			when 'auth.login'  then return @authentication.login(params, callback)
			when 'auth.logout' then return @authentication.logout(callback)

		# если это "внутренний" Json Rpc метод, выполнить его
		if Json_rpc.has(method)
			action = Json_rpc.methods[method]

			# можно попробовать совместить код ниже в одну цепочку

			# если эта команда Json rpc не требует авторизации
			if action.public
				return action(params, callback)

			# если эта команда Json rpc требует авторизации
			return @authorize(respond, json_rpc_request).and ->
				# копипаста
				action(params, callback)

		# иначе, это autonomous_testing, и выдать ответ-заглушку для данной Json Rpc команды

		execute = ->
			# log.debug("Autonomous testing mode.")

			if not stub[method]?
				return callback(Json_rpc.errors.METHOD_NOT_FOUND)

			result = stub[method]

			if typeof result == 'function' 
				result = result(params)

			callback(no, result)

		if @is_public(json_rpc_request)
			execute()
		else
			@authorize(respond, json_rpc_request).and(execute)

	# валидация Json Rpc запроса
	@validate: (json_rpc_request) ->
		if not json_rpc_request.method || not json_rpc_request.params || not json_rpc_request.id
			return no
		return yes

	# генерирует классическую функцию callback, которую можно вызывать, 
	# чтобы выдать результат выполнения Json Rpc команды
	@callback: (respond, json_rpc_request) ->

		callback = (error, result) =>

			# если error - не undefined, не null и не false (no)
			if error
				console.error("Error in method #{json_rpc_request.method}")
				console.error(error)

				return respond(@error(error, json_rpc_request))

			if not result && result != 0
				result = yes

			respond(@response(result, json_rpc_request))

	# добавить внутреннюю Json Rpc команду
	@add_method: (name, action) ->
		# если у метода есть префикс $public_, то убрать этот префикс, и пометить метод как public
		is_public = no
		public_method_pattern = /([^\.]+\.)?\$public_/
		if public_method_pattern.test(name)
			name = name.replace(public_method_pattern, '$1')
			is_public = yes

		@methods[name] = action

		# @methods[name] = (params, respond) ->
		# 	action(params, @callback(respond))

		@methods[name].public = is_public

		# console.log('added api method: ', name)

	# добавить внутренние Json Rpc команды (берутся все методы из объекта)
	@add_methods: (object) ->
		self = @
		prefix = object.constructor.name
		for key, action of object
			if typeof action == "function"
				self.add_method(prefix + '.' + key, action.bind(object))

	# формат Json Rpc запроса
	@request: (method, parameters) ->
		json =
			jsonrpc : '2.0'
			id      : 228
			method  : method
			params  : parameters

	# формат Json Rpc ответа
	@response: (result, json_rpc_request) ->
		json =
			jsonrpc : '2.0'
			method  : json_rpc_request.method
			id      : json_rpc_request.id
			result  : result

	# формат Json Rpc ответа при ошибке
	@error: (error, json_rpc_request) ->
		
		log.error(error)

		# normalize error
		error =  
			if not error?
				@errors._ERROR
			else if typeof error == 'string'
				code    : 0
				message : error
			else if error.code && error.message
				code    : error.code
				message : error.message 
			else
				@errors.INTERNAL_ERROR
		
		# log.error(error)

		method = if json_rpc_request instanceof Array
			'[Json Rpc batch]'
		else
			json_rpc_request.method

		log.error("#{method}: #{error.message}")

		data = 
			jsonrpc : '2.0'
			method  : method
			id      : json_rpc_request.id
			error   : error

	# есть ли такая команда Json Rpc
	@has: (method) ->
		switch method
			when 'auth.auth'   then yes
			when 'auth.login'  then yes
			when 'auth.logout' then yes
			else @methods[method]

	# если это batching, проверить, однороден ли набор команд
	# (если только внешние команды - можно их проксировать вовне более эффективно)
	#
	# если batch содержит только внутренние команды, то он помечается как 'internal';
	# если batch содержит только внешние команды, то он помечается как 'external';
	# если batch содержит как внутренние, так и внешние команды, то он помечается как 'mixed';
	@classify_batch: (batch) ->

		# при тестировании на "заглушке" все команды - внутренние
		if configuration.autonomous_testing
			return 'internal'

		commands_type = null

		for json_rpc_request in batch
			command_type = if @methods[json_rpc_request.method] then 'internal' else 'external'

			if not commands_type
				commands_type = command_type
			else if commands_type != command_type
				return 'mixed'

		return commands_type
	
# проксирование запросов на другой сервер
class Proxy

	# неэффективное проксирование
	# (потребляет оперативную память в объёме всех данных ответа)
	#
	# используется в том случае, если ответ нужно записать не в http response
	@buffered: (request_json, callback) ->

		if not configuration.backend
			throw new Error('Json Rpc proxying not enabled')

		post_data = JSON.stringify(request_json)

		post_options = 
			host: configuration.backend.host
			port: configuration.backend.port
			path: '/api'
			method: 'POST'
			headers:
				'Content-Type': 'application/json'
				'Content-Length': post_data.length

		post_request = http.request post_options, (result) ->
			result.setEncoding('utf8')
			chunks = []
			result.on('data', (chunk) -> chunks.push(chunk))
			result.on('end', () -> callback(chunks.join('')))

		post_request.write(post_data)
		post_request.end()

	# простое эффективное проксирование
	# (не потребляет памяти для хранения ответа, а просто перенаправляет потоки туда/сюда)
	#
	# используется в том случае, если ответ нужно записать в http response
	@flow: (request_json, http_response) ->
		# log.debug('-- Proxying: ', request_json)

		if not configuration.backend
			throw new Error('Json Rpc proxying not enabled')

		data = JSON.stringify(request_json)

		requested = 
			host: configuration.backend.host
			port: configuration.backend.port
			path: '/api'
			method: 'POST'
			headers:
				'Content-Type': 'application/json'
				'Content-Length': data.length

		custom_response_headers = []

		request = http.request(requested, (response) ->
			headers = Object.clone(response.headers)

			compressed = response.headers['content-encoding'] == 'gzip'

			if compressed
				headers['content-length']   = null
				headers['content-encoding'] = null

			headers = Object.extend(headers, custom_response_headers)
			
			http_response.writeHead(response.statusCode, headers)

			# result.setEncoding('utf8')

			if compressed
				response = response.pipe(require('zlib').createGunzip())

			response.pipe(http_response)
		)

		# Post data
		if data
			request.write(data)

		request.end()

module.exports = Json_rpc