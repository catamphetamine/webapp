// This module has a lot of dependencies
// because it `require()`s all the client side code,
// and therefore it takes about 5 sec to start 
// this webpage rendering webserver.
//
// Maybe it's because Babel on-the-fly code transformation 
// is slow, or maybe Node.js require() is slow 
// (which I don't think could be the case).

// import look from 'look'
// look.start()

import React from 'react'

import webpage_server from 'react-isomorphic-render/page-server'
import is_intl_locale_supported from 'intl-locales-supported'
import file_size_parser from 'filesize-parser'

import common         from '../client/react-isomorphic-render'
import html_assets    from '../client/html assets'
import on_error       from '../client/helpers/error handler'

import load_locale_data from './locale'

// A faster way to load all the localization data for Node.js
// (`intl-messageformat` will load everything automatically when run in Node.js)
require('javascript-time-ago/load-all-locales')

const initializing_javascript = `
	document.body.classList.add('javascript-is-enabled')

	window.configuration =
	{
		image_service:
		{
			file_size_limit: ${file_size_parser(configuration.image_service.file_size_limit)}
		}
	}
`

// starts webpage rendering server
const server = webpage_server
({
	// enable/disable development mode (true/false)
	development: _development_,

	disable_server_side_rendering : _disable_server_side_rendering_,

	// Http host and port for executing all client-side ajax requests on server-side
	application:
	{
		host: configuration.web_server.http.host,
		port: configuration.web_server.http.port
	},

	// Http Urls to javascripts and (optionally) CSS styles 
	// which will be insterted into the <head/> element of the resulting Html webpage
	// (as <script src="..."/> and <link rel="style" href="..."/> respectively)
	//
	// Also a website "favicon".
	//
	assets: (url) =>
	{
		if (_development_)
		{
			webpack_isomorphic_tools.refresh()
		}

		const assets = webpack_isomorphic_tools.assets()

		const result = 
		{
			entry      : 'main',

			javascript : assets.javascript,
			style      : assets.styles,

			icon : html_assets.icon()
		}

		return result
	},

	// this CSS will be inserted into server rendered webpage <head/> <style/> tag 
	// (when in development mode only - removes rendering flicker)
	style: () => html_assets.style().toString(),

	// user info preloading
	// (will be added to Redux store)
	preload: async (http) =>
	{
		let user = await http.post(`/authentication/authenticate`)

		// convert empty object `{}` to `undefined`
		user = user.id ? user : undefined

		return { authentication: { user } }
	},

	// internationalization
	localize: async (store, preferred_locale) =>
	{
		// Determine preferred locales

		const preferred_locales = []

		if (store.getState().authentication 
			&& store.getState().authentication.user 
			&& store.getState().authentication.user.locale)
		{
			preferred_locales.push(store.getState().authentication.user.locale)
		}

		preferred_locales.push(preferred_locale)
		preferred_locales.push('en-US')

		// Choose an appropriate locale and load the corresponding messages 
		// (prefer locales from the `preferred_locales` list)
		let { locale, messages } = await load_locale_data(preferred_locales, { force_reload: _development_ })

		// Store the locale in Redux store
		store.dispatch({ type: 'locale', locale })

		// Check if the Intl object supports the chosen locale.
		// If not then load Intl polyfill instead.
		if (global.Intl)
		{
			// Determine if the built-in `Intl` has the locale data we need.
			if (!is_intl_locale_supported(locale))
			{
				// `Intl` exists, but it doesn't have the data we need, so load the
				// polyfill and patch the constructors we need with the polyfill's.
				const Intl_polyfill = require('intl')
				Intl.NumberFormat   = Intl_polyfill.NumberFormat
				Intl.DateTimeFormat = Intl_polyfill.DateTimeFormat
			}
		}
		else
		{
			// No `Intl`, so use and load the polyfill.
			global.Intl = require('intl')
		}

		// These variables will be passed down 
		// as `props` for the `markup_wrapper` React component
		return { locale, messages }
	},

	// (optional)
	// returns an array of React elements.
	// which will be inserted into server rendered webpage's <head/>
	// (use `key`s to prevent React warning)
	// head: () => React element or an array of React elements

	// (optional)
	// returns a React element.
	// allows for wrapping React page component with arbitrary markup
	// (or doing whatever else can be done with a React element).
	// returns either a React element or an array of React elements
	// which will be inserted into server rendered webpage's <body/>
	// body: react_page_element => react_page_element

	// returns an array of React elements.
	// allows adding arbitrary React components to the start of the <body/>
	// (use `key`s to prevent React warning when returning an array of React elements)
	body_start: () =>
	{
		if (_development_)
		{
			return [
				<script key="1" dangerouslySetInnerHTML={{__html: initializing_javascript}}/>,
				<script key="2" src="/assets/vendor.dll.js"/>
			]
		}
		
		return <script dangerouslySetInnerHTML={{__html: initializing_javascript}}/>
	},

	// (optional)
	// returns an array of React elements.
	// allows adding arbitrary React components to the end of the <body/>
	// (use `key`s to prevent React warning when returning an array of React elements)
	// body_end: () => React element or an array of React elements

	// handles errors occuring while rendering pages
	on_error
},
common)

// Start webpage rendering server
server.listen(configuration.webpage_server.http.port, function(error)
{
	if (error)
	{
		console.log('Webpage rendering server shutdown due to an error')
		return log.error(error)
	}

	const host = 'localhost'

	log.info(`Webpage server is listening at http://${host ? host : 'localhost'}:${configuration.webpage_server.http.port}`)
})