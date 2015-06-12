fs      = require 'fs'
http    = require 'http'
https   = require 'https'
restify = require 'restify'

# http://mcavage.me/node-restify/
web = restify.createServer(
	# certificate: ...
	# key: ...
	name: 'cinema'
	log: log
)

global.web = web

web.pre(restify.pre.userAgentConnection())

# Api

Json_rpc = include 'json rpc'
json_rpc = -> Json_rpc.create.apply(@, arguments)
global.json_rpc = json_rpc

serve_api = (path) -> Json_rpc.add_methods(new (include("api/#{path}"))())

serve_api 'auth'
serve_api 'utility'

# Force Https

# app.get '*', (request, response, next) ->

# попробовать можно: request.isSecure()

# 	host = request.get('host')
# 	if host.has(':')
# 		host = host.before(':')

# 	host_port = host
# 	if configuration.webserver.https.port != 443
# 		host_port += ":#{configuration.webserver.https.port}"

# 	if not request.connection.encrypted
# 		response.redirect("https://#{host_port}#{request.url}")
# 	else
# 		next()

web.use(restify.acceptParser(web.acceptable))
web.use(restify.authorizationParser())
web.use(restify.dateParser())
web.use(restify.queryParser())
web.use(restify.jsonp())
web.use(restify.gzipResponse())
web.use(restify.bodyParser({
	maxBodySize: 0
	mapParams: yes
	mapFiles: no
	# overrideParams: false
	# multipartHandler: (part) ->
	# 	part.on 'data', (data) ->
	# 		# do something with the multipart data
	# multipartFileHandler: (part) ->
	# 	part.on 'data', (data) ->
	# 		# do something with the multipart file data
	# keepExtensions: false
	uploadDir: require('os').tmpdir()
	multiples: yes
}))

web.use (request, response, next) ->
	request.parameters = request.params
	next()
	
web.use(restify.CORS({
	# origins: ['https://foo.com', 'http://bar.com', 'http://baz.com:8081'],   // defaults to ['*']
	# credentials: true,                 // defaults to false
	# headers: ['x-foo']                 // sets expose-headers
}))

# busboy is supposed to be better than formidable
# app.use(require('connect-busboy')({ highWaterMark: 10 * 1024 * 1024, limits: { fileSize: 100 * 1024 * 1024 } }))

for method in ['get', 'post', 'put', 'delete', 'head']
	do (method) ->
		method_function = web[method]
		web[method] = (path, handler) ->
			simpler_handler = handler
			handler = (request, response, next) ->
				next_explicitly_called = no
				self_detecting_next = ->
					next_explicitly_called = yes
					next.apply(@, arguments)

				simpler_handler(request, response, self_detecting_next)

				if not next_explicitly_called
					self_detecting_next()

			method_function.apply(@, arguments)

socket_io = require('socket.io')
# websocket.path('/websocket.io')
websocket = socket_io.listen(web.server) # (web)

websocket.serveClient(no)

api = websocket.of '/api'
api.on 'connection', (socket) ->
	socket.on 'call', (request) ->
		json_rpc(request).then (response) ->
			socket.emit('return', response)

# routes
# require('./rest api')

# app.get '/lib/ace-builds/src-min/theme-jsoneditor.js', (request, response) ->
# 	response.sendfile(Root_folder + '/public/lib/jsoneditor/asset/ace/theme-jsoneditor.js')

# https_options = 
# 	key  : fs.readFileSync("#{Root_folder}/#{configuration.webserver.https.private_key}")
# 	cert : fs.readFileSync("#{Root_folder}/#{configuration.webserver.https.certificate}")

# http.createServer(app).listen(configuration.webserver.http.port)
# https.createServer(https_options, app).listen(configuration.webserver.https.port)

# web.get /.*/, ->
# 	restify.serveStatic({
# 		directory: "#{Root_folder}/build/client"
# 		default: 'index.html'
# 	})

React = require 'react'

web.get '/react', (request, response) ->
	# здесь будет серверный рендеринг
	# html = React.renderToStaticMarkup(body(null))

web.listen configuration.webserver.http.port, ->
	# log.info "web server listening at #{web.url}"
	# log.info "socket.io server listening at #{web.url}"