import fs            from 'fs'
import path          from 'path'
import http          from 'http'
import https         from 'https'
import os            from 'os'
import url           from 'url'

import koa         from 'koa'
import session     from 'koa-session'
// https://github.com/Chilledheart/koa-session-redis
// import cors        from 'kcors'
// import csrf        from 'koa-csrf'
// import body_parser from 'koa-body-parsers'
import body_parser from 'koa-bodyparser'
import compress    from 'koa-compress'
import koa_logger  from 'koa-bunyan'
import koa_proxy   from 'koa-proxy'
import mount       from 'koa-mount'
import koa_locale  from 'koa-locale'

import { render } from './webpage rendering'

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

// // Proxy to API server
web.use(mount('/api', koa_proxy({ host: `http://${configuration.api_server.http.host}:${configuration.api_server.http.port}` })))

// Usage: this.request.body
web.use(body_parser({ formLimit: '100mb' }))

web.keys = configuration.session_secret_keys
web.use(session(web))
// this.session

koa_locale(web, 'locale')

// web.use(function *()
// {
// 	// query: '?locale=en'
// 	this.locale = this.getLocaleFromQuery() || this.getLocaleFromCookie() || this.getLocaleFromHeader()
// })

// серверный ("изоморфный") рендеринг
web.use(function*()
{
	yield render
	({
		preferred_locale : this.getLocaleFromQuery() || this.getLocaleFromCookie() || this.getLocaleFromHeader() || 'en',
		request          : this.request, 
		respond          : ({ markup, status }) =>
		{
			this.body = markup
			if (status)
			{
				this.status = status
			}
		}, 
		fail             : error => this.throw(error), 
		redirect         : to => this.redirect(to)
	})
})

// log all errors
web.on('error', function(error, context)
{
	log.error(error, context)
})

// http server
const http_web_server = http.createServer()

// enable Koa for handling http requests
http_web_server.on('request', web.callback())

// copy-pasted from 
// https://github.com/koajs/koala/blob/master/lib/app.js
//
// "Expect: 100-continue" is something related to http request body parsing
// http://crypto.pp.ua/2011/02/mexanizm-expectcontinue/

// const koa_callback = web.callback()
// http_web_server.on('request', koa_callback)
// http_web_server.on('checkContinue', function(request, response)
// {
// 	// requests with `Expect: 100-continue`
// 	request.checkContinue = true
// 	koa_callback(request, response)
// })

// поднять http сервер
http_web_server.listen(configuration.webpage_server.http.port, error =>
{
	if (error)
	{
		return log.error(error)
	}

	log.info(`Webpage server is listening at http://${configuration.webpage_server.http.host}:${configuration.webpage_server.http.port}`)

})

export default web