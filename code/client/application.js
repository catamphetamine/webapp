// import 'babel/polyfill'

import language       from '../common/language'

import React          from 'react'
import ReactDOM       from 'react-dom'

import { render }     from 'react-isomorphic-render/redux'
import create_store   from './redux/store'
import markup_wrapper from './markup wrapper'

// include these assets in webpack build (styles, images)

import html_assets from './html assets'

for (let asset of Object.keys(html_assets))
{
	html_assets[asset]()
}

import inject_tap_event_plugin from 'react-tap-event-plugin'

//Needed for onTouchTap
//Can go away when react 1.0 release
//Check this repo:
//https://github.com/zilverline/react-tap-event-plugin
inject_tap_event_plugin()

// import ajax from './tools/ajax'
// global.ajax = ajax

// doesn't matter, just initialize it with something
let _locale = 'en'

import international from './international'

// load the Intl polyfill and its locale data before rendering the application
international.load().then(() =>
{
	// since react-intl assumes Intl is already in the global scope, 
	// we can't import the routes (which imports react-intl in some of its components) 
	// before polyfilling Intl. That's why you see require("./routes") here, 
	// and not as import on the top of the file.
	const create_routes = require('./routes')

	// renders the webpage on the client side
	render
	({
		// enable/disable development mode (true/false)
		development: _development_,

		// enable/disable Redux dev-tools (true/false)
		development_tools: _development_tools_,

		// a function to create Redux store
		create_store,

		// creates React-router routes
		create_routes,

		// wraps React page component into arbitrary markup (e.g. Redux Provider)
		markup_wrapper,

		// internationalization
		load_localized_messages: locale =>
		{
			// makes Webpack HMR work for this locale for now
			_locale = locale

			switch (locale)
			{
				case 'ru':
					return new Promise(resolve =>
					{
						require.ensure(['./international/ru'], require =>
						{
							resolve(require('./international/ru'))
						})
					})

				default:
					return new Promise(resolve =>
					{
						require.ensure(['./international/en'], require =>
						{
							resolve(require('./international/en'))
						})
					})
			}
		}
	})
	.then(({ rerender }) =>
	{
		// `_development_` flag is needed here
		// to make sure that Webpack doesn't include
		// the whole `./international` folder into the `main` bundle
		// in production mode (because that's the sole point of code splitting)
		//
		if (_development_ && module.hot)
		{
			module.hot.accept(require.resolve('./international/' + _locale + '.js'), function()
			{
				rerender()
			})
		}
	})
})

// used in './international' for debug output
window.debug = (...parameters) => { console.log.bind(console)(parameters) }