// import look from 'look'
// look.start()

import React from 'react'

import webpage_server from 'react-isomorphic-render/page-server'

import create_store   from '../client/redux/store'
import create_routes  from '../client/routes'
import markup_wrapper from '../client/markup wrapper'
import html_assets    from '../client/html assets'

import load_locale_data from './locale'

// starts webpage rendering server
webpage_server
({
	// enable/disable development mode (true/false)
	development: _development_,

	disable_server_side_rendering : _disable_server_side_rendering_,

	// on which Http host and port to start the webpage rendering server
	// host: optional
	port: configuration.webpage_server.http.port,

	// Http host and port for executing all client-side ajax requests on server-side
	web_server:
	{
		host: configuration.web_server.http.host,
		port: configuration.web_server.http.port
	},

	// Http Urls to javascripts and (optionally) CSS styles 
	// which will be insterted into the <head/> element of the resulting Html webpage
	// (as <script src="..."/> and <link rel="style" href="..."/> respectively)
	assets: () =>
	{
		if (_development_)
		{
			webpack_isomorphic_tools.refresh()
		}

		return webpack_isomorphic_tools.assets()
	},

	// wraps React page component into arbitrary markup (e.g. Redux Provider)
	markup_wrapper,

	// a function to create Redux store
	create_store,

	// creates React-router routes
	create_routes,

	// internationalization
	localize: (store, preferred_locale) =>
	{
		let { locale, messages } = load_locale_data(preferred_locale || 'en')

		store.dispatch({ type: 'locale set', locale: locale })

		return { language: get_language_from_locale(locale), messages }
	},

	// will be inserted into server rendered webpage <head/>
	// (use `key`s to prevent React warning)
	head: () =>
	{
		return [<link rel="shortcut icon" href={html_assets.icon()} key="1"/>]
	},

	// body: optional, extra <body/> content

	// this CSS will be inserted into server rendered webpage <head/> <style/> tag 
	// (when in development mode only - removes rendering flicker)
	styles: () => html_assets.style().toString(),

	// bunyan log
	log: log
})