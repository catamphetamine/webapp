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

// import ajax from './tools/ajax'
// global.ajax = ajax

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

		// the DOM element where React markup will be rendered
		to: document.getElementById('react_markup'),

		// a function to create Redux store
		create_store,

		// creates React-router routes
		create_routes,

		// wraps React page component into arbitrary markup (e.g. Redux Provider)
		markup_wrapper
	})
})

// used in './international' for debug output
window.debug = (...parameters) => { console.log.bind(console)(parameters) }