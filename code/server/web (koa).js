import fs            from 'fs'
import path          from 'path'
import http          from 'http'
import https         from 'https'
import os            from 'os'
import url           from  'url'
import socket_io     from 'socket.io'
import log           from './log'
import configuration from './configuration'
import api           from './api'

import koa         from 'koa'
import session     from 'koa-session'
// https://github.com/Chilledheart/koa-session-redis
import cors        from 'kcors'
// import csrf        from 'koa-csrf'
// import body_parser from 'koa-body-parsers'
import body_parser from 'koa-bodyparser'
import compress    from 'koa-compress'
import statics     from 'koa-static-cache'
import koa_logger  from 'koa-bunyan'
import koa_proxy   from 'koa-proxy'
import mount       from 'koa-mount'
import koa_locale  from 'koa-locale'

// https://github.com/chentsulin/koa-graphql

// https://github.com/koa-modules/locale

const web = koa()

web.use(koa_logger(log,
{
	// which level you want to use for logging?
	// default is info
	level: 'debug',
	// this is optional. Here you can provide request time in ms,
	// and all requests longer than specified time will have level 'warn'
	timeLimit: 100
}))

// хз, нужно ли сжатие в node.js: мб лучше поставить впереди nginx'ы, 
// и ими сжимать, чтобы не нагружать процесс node.js
web.use(compress())

// serve statics
// (don't serve "index.html" files)
//
// https://github.com/koajs/koa/issues/466
//
web.use(mount('/assets', statics(path.join(Root_folder, 'build', 'assets'), 
{
	maxAge : 365 * 24 * 60 * 60,
	gzip   : true
})))

// // Proxy to API server
web.use(mount('/api', koa_proxy({ host: `http://${configuration.api_server.http.host}:${configuration.api_server.http.port}` })))

web.use(body_parser())
// this.request.body

web.keys = ['hammertime']
web.use(session(web))
// this.session

koa_locale(web, 'locale')

// web.use(function *()
// {
// 	// query: '?locale=en'
// 	this.locale = this.getLocaleFromQuery() || this.getLocaleFromCookie() || this.getLocaleFromHeader()
// })

import { render } from './webpage rendering'

function get_language(locale)
{
	const dash_index = locale.indexOf('-')
	if (dash_index >= 0)
	{
		return locale.substring(0, dash_index)
	}
	return locale
}

// серверный ("изоморфный") рендеринг
web.use(function*()
{
	yield render
	({
		locale   : get_language(this.getLocaleFromQuery() || this.getLocaleFromCookie() || this.getLocaleFromHeader() || 'en'),
		request  : this.request, 
		respond  : data => this.body = data, 
		fail     : error => this.throw(error), 
		redirect : to => this.redirect(to)
	})
})

// log all errors
web.on('error', function(error, context)
{
	log.error(error, context)
})

// http server
const http_web_server = http.createServer()

// websocket server
const websocket = socket_io.listen(http_web_server)
websocket.serveClient(false)

const koa_callback = web.callback()

http_web_server.on('request', koa_callback)

http_web_server.on('checkContinue', function(request, response)
{
	// requests with `Expect: 100-continue`
	request.checkContinue = true
	koa_callback(request, response)
})

// поднять http сервер
http_web_server.listen(configuration.webserver.http.port, error =>
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

export default web