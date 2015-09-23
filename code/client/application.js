import 'babel/polyfill'

import language       from '../language'

import React          from 'react'

import api_client     from './api client'
import { client }     from '../react-isomorphic-render'
import create_store   from './redux/store'

// include these assets in webpack build (styles, images)
import html from './html'
html.require_assets()

import international from './international'

// Load the Intl polyfill and required locale data

const locale = document.documentElement.getAttribute('lang')

// load the Intl polyfill and its locale data before rendering the application
international.load_polyfill(locale)
	.then(international.load_locale_data.bind(null, locale))
	.then(() =>
	{
		let development_tools
		if (_development_tools_)
		{
			development_tools = require('redux-devtools/lib/react')
		}

		// since react-intl assumes Intl is already in the global scope, 
		// we can't import the routes (which imports react-intl in some of its components) 
		// before polyfilling Intl. That's why you see require("./routes") here, 
		// and not as import on the top of the file.
		client
		({
			development       : _development_,
			development_tools : development_tools,
			routes            : require('./routes'),
			// history           : create_history(),
			store             : create_store(new api_client(), window._flux_store_data),
			content_container : document.getElementById('content')
		})
	})
	.catch(error =>
	{
		console.error(error)
	})

window.debug = (...parameters) => { console.log.bind(console)(parameters) }