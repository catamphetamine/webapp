import fs            from 'fs'
import http          from 'http'
import https         from 'https'
import restify       from 'restify'
import os            from 'os'
import socket_io     from 'socket.io'
import log           from './log'
import configuration from './configuration'
import json_rpc      from './libraries/json rpc'
import utility       from './api/utility'

// http://mcavage.me/node-restify/
const web = restify.createServer
({
	// certificate: ...
	// key: ...
	name: 'cinema',
	log: log
})

web.pre(restify.pre.userAgentConnection())

// Api

json_rpc.add('utility', utility)

// Force Https

// app.get '*', (request, response, next) ->

// попробовать можно: request.isSecure()

// 	host = request.get('host')
// 	if host.has(':')
// 		host = host.before(':')

// 	host_port = host
// 	if configuration.webserver.https.port != 443
// 		host_port += ":#{configuration.webserver.https.port}"

// 	if not request.connection.encrypted
// 		response.redirect("https://#{host_port}#{request.url}")
// 	else
// 		next()

web.use(restify.acceptParser(web.acceptable))
web.use(restify.authorizationParser())
web.use(restify.dateParser())
web.use(restify.queryParser())
web.use(restify.jsonp())
web.use(restify.gzipResponse())
web.use(restify.bodyParser
({
	maxBodySize: 0,
	mapParams: true,
	mapFiles: false,
	// overrideParams: false
	// multipartHandler: (part) ->
	// 	part.on 'data', (data) ->
	// 		// do something with the multipart data
	// multipartFileHandler: (part) ->
	// 	part.on 'data', (data) ->
	// 		// do something with the multipart file data
	// keepExtensions: false
	uploadDir: os.tmpdir(),
	multiples: true
}))

web.use((request, response, next) =>
{
	request.parameters = request.params
	next()
})
	
web.use(restify.CORS({
	// origins: ['https://foo.com', 'http://bar.com', 'http://baz.com:8081'],   // defaults to ['*']
	// credentials: true,                 // defaults to false
	// headers: ['x-foo']                 // sets expose-headers
}))

// busboy is supposed to be better than formidable
// app.use(require('connect-busboy')({ highWaterMark: 10 * 1024 * 1024, limits: { fileSize: 100 * 1024 * 1024 } }))

for (let method of ['get', 'post', 'put', 'delete', 'head'])
{
	const method_function = web[method]
	web[method] = function(path, handler)
	{
		const simpler_handler = handler
		handler = (request, response, next) =>
		{
			let next_explicitly_called = false
			self_detecting_next = () =>
			{
				next_explicitly_called = true
				next.apply(this, arguments)
			}

			simpler_handler(request, response, self_detecting_next)

			if (!next_explicitly_called) {
				self_detecting_next()
			}
		}

		method_function.apply(this, arguments)
	}
}

// websocket.path('/websocket.io')
const websocket = socket_io.listen(web.server) // should be (web), restify is broken
websocket.serveClient(false)

// websocket не обеспечивает гарантий доставки
// http://stackoverflow.com/questions/20685208/websocket-transport-reliability-socket-io-data-loss-during-reconnection
const api = websocket.of('/api')
api.on('connection', socket =>
{
	socket.on('call', request =>
	{
		json_rpc.process(request).then(response =>
		{
			socket.emit('return', response)
		})
		.catch(error =>
		{
			log.error(error.stack || error)
			response.send(json_rpc.error(request))
		})
	})
})

web.post('/api', (http_request, http_response) => 
{
	const request = http_request.body

	json_rpc.process(request).then(response =>
	{
		http_response.send(response)
	})
	.catch(error =>
	{
		log.error(error.stack || error)
		http_response.send(json_rpc.error(request))
	})
})

// routes
// require('./rest api')

// app.get '/lib/ace-builds/src-min/theme-jsoneditor.js', (request, response) ->
// 	response.sendfile(Root_folder + '/public/lib/jsoneditor/asset/ace/theme-jsoneditor.js')

// https_options = 
// 	key  : fs.readFileSync("#{Root_folder}/#{configuration.webserver.https.private_key}")
// 	cert : fs.readFileSync("#{Root_folder}/#{configuration.webserver.https.certificate}")

// http.createServer(app).listen(configuration.webserver.http.port)
// https.createServer(https_options, app).listen(configuration.webserver.https.port)

// web.get /.*/, ->
// 	restify.serveStatic({
// 		directory: "#{Root_folder}/build/client"
// 		default: 'index.html'
// 	})

import React from 'react'
import Router from 'react-router'
// import routes from './../client/routes.react'

// серверный рендеринг; http://localhost:3000/react
web.get('/react', (request, response) =>
{
	// html = React.renderToStaticMarkup(body(null))

	// Router.run(routes, request.path, (Handler, router) => 
	// {
	// 	Transmit.renderToString(Handler).then(({reactString, reactData}) => 
	// 	{
	// 		let output = 
	// 		(
	// 			`<!doctype html>
	// 			<html lang="en-us">
	// 				<head>
	// 					<meta charset="utf-8">
	// 					<title>Isomorphic React</title>
	// 					<link rel="shortcut icon" href="/images/favicon/favicon-32x32.png">
	// 				</head>
	// 				<body>
	// 					<section id="layout">${reactString}</section>
	// 				</body>
	// 			</html>`
	// 		)

	// 		const webserver = process.env.NODE_ENV === 'production' ? '' : '//localhost:8080'
	// 		output = Transmit.injectIntoMarkup(output, reactData, [`${webserver}/dist/client.js`])

	// 		response.writeHead(200, { 'Content-type': 'text/html' })
	// 		response.end(output)
	// 	})
	// 	.catch((error) => 
	// 	{
	// 		reply(error.stack).type("text/plain").code(500)
	// 	})
	// })
})

web.listen(configuration.webserver.http.port, () =>
{
	// log.info "web server listening at #{web.url}"
	// log.info "socket.io server listening at #{web.url}"
})

export default web