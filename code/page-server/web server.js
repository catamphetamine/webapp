import path from 'path'

import web_server from '../common/web server'

import { render } from './webpage rendering'

const web = web_server({ compress: true, session: true, extract_locale: true })

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

// поднять http сервер
web.listen(configuration.webpage_server.http.port).then(() =>
{
	log.info(`Webpage server is listening at http://${configuration.webpage_server.http.host}:${configuration.webpage_server.http.port}`)
},
error =>
{
	log.error(error)
})