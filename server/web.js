import fs            from 'fs'
import path          from 'path'
import http          from 'http'
import https         from 'https'
import os            from 'os'
import socket_io     from 'socket.io'
import express       from 'express'
import log           from './log'
import configuration from './configuration'
import api           from './api'

import React from 'react'
import Router from 'react-router'
import Location from 'react-router/lib/Location'

import Html from './../client/html'
import ApiClient from './../client/api client'
import router from './../client/router'
import create_store from './../client/flux/redux/create'

import compression from 'compression'
import serve_static from 'serve-static'

import http_proxy from 'http-proxy'

import url from 'url'
import cors from 'cors'
import body_parser from 'body-parser'
import cookie_parser from 'cookie-parser'

import express_session from 'express-session'

const web = new express()

// Api

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

// # https://github.com/expressjs/session/issues/173
// memory_store = require(__dirname + '/lib/MemoryStore')
// store = new memory_store({ timeout: configuration.webserver.session_timeout })
// app.set('session_store', store)
	
// busboy is supposed to be better than formidable
// app.use(require('connect-busboy')({ highWaterMark: 10 * 1024 * 1024, limits: { fileSize: 100 * 1024 * 1024 } }))

// websocket.path('/websocket.io')
const websocket = socket_io.listen(web.server) // should be (web), restify is broken
websocket.serveClient(false)

// // websocket не обеспечивает гарантий доставки
// // http://stackoverflow.com/questions/20685208/websocket-transport-reliability-socket-io-data-loss-during-reconnection
// const api = websocket.of('/api')
// api.on('connection', socket =>
// {
// 	socket.on('call', request =>
// 	{
// 		json_rpc.process(request).then(response =>
// 		{
// 			socket.emit('return', response)
// 		})
// 		.catch(error =>
// 		{
// 			log.error(error.stack || error)
// 			response.send(json_rpc.error(request))
// 		})
// 	})
// })

// require('./rest api')

// app.get '/lib/ace-builds/src-min/theme-jsoneditor.js', (request, response) ->
// 	response.sendfile(Root_folder + '/public/lib/jsoneditor/asset/ace/theme-jsoneditor.js')

// хз, нужно ли сжатие в node.js: мб лучше поставить впереди nginx'ы, 
// и ими сжимать, чтобы не нагружать процесс node.js
web.use(compression())
web.use(serve_static(path.join(__dirname, '..', 'build')))

const webpack_stats_path = path.resolve(__dirname, '..', 'build', 'webpack-stats.json')

let webpack_stats

function refresh_webpack_stats()
{
	webpack_stats = require(webpack_stats_path)

	if (_development_)
	{
		// Do not cache webpack stats: the script file would change since
		// hot module replacement is enabled in the development env
		delete require.cache[require.resolve(webpack_stats_path)]
	}
}

if (_production_)
{
	refresh_webpack_stats()
}

const proxy = http_proxy.createProxyServer
({
	target: `http://${configuration.api_server.http.host}:${configuration.api_server.http.port}`
})

// Proxy to API server
web.use('/api', (request, response) =>
{
	proxy.web(request, response)
})

const cors_options =
{
	// origin: 'http://example.com'
}

web.use(cors(cors_options))
web.use(body_parser.json())
web.use(body_parser.urlencoded({ limit: 1099511627776, extended: true })) // 1 Terabyte

web.use(cookie_parser())

const is_https = false
web.use(express_session({ name: `for_port_${configuration.webserver.http.port}`, secret: 'is kept', resave: true, saveUninitialized: true, cookie: { secure: is_https, maxAge: 100 * 365 * 24 * 60 * 60 * 1000 } }))

web.use((request, response, next) =>
{
	request.parameters = request.params
	next()
})

// серверный рендеринг; http://localhost:3000
web.use((request, response) =>
{
	if (_development_)
	{
		refresh_webpack_stats()
	}

	const client = new ApiClient(request)
	const store = create_store(client)
	const location = new Location(request.path, request.query)

	if (_disable_server_side_rendering_)
	{
		return response.send('<!doctype html>\n' +
			React.renderToString(<Html webpackStats={webpack_stats} component={<div/>} store={store}/>))
	}

	router(location, undefined, store)
	.then(({component, transition, redirect}) =>
	{
		try
		{
			if (redirect)
			{
				return response.redirect(transition.redirectInfo.pathname)
			}

			response.send('<!doctype html>\n' +
				React.renderToString(<Html webpackStats={webpack_stats} component={component} store={store}/>))
		}
		catch (error)
		{
			log.error(error)
			response.status(500).send({error: error})
		}
	},
	(error) =>
	{
		log.error(error)
		response.status(500).send({error: error})
	})
})

// поднять http сервер
http.createServer(web).listen(configuration.webserver.http.port, error =>
{
	if (error)
	{
		return log.error(error)
	}

	api().then(() =>
	{
		log.info(`Web server is listening`)
		log.info(`Now go to http://${configuration.webserver.http.host}:${configuration.webserver.http.port}`)
	},
	error =>
	{
		log.error(error)
	})
})

// // сертификаты для SSL
// https_options = 
// 	key  : fs.readFileSync("#{Root_folder}/#{configuration.webserver.https.private_key}")
// 	cert : fs.readFileSync("#{Root_folder}/#{configuration.webserver.https.certificate}")

// // поднять https сервер
// https.createServer(https_options, app).listen configuration.webserver.https.port, ->
// 	log.info "================================================="
// 	log.info "= GUI доступен по адресу https://localhost:#{configuration.webserver.https.port} ="
// 	log.info "================================================="

export default web