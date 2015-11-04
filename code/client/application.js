import 'babel/polyfill'

import language       from '../language'

import React          from 'react'
import ReactDOM       from 'react-dom'

import api_client     from './api client'
import { client }     from '../react-isomorphic-render'
import create_store   from './redux/store'
import markup_wrapper from './markup wrapper'

import dev_tools from './redux/dev tools'

// include these assets in webpack build (styles, images)
import html from './html'
html.require_assets()

// import ajax from './tools/ajax'
// global.ajax = ajax

import international from './international'

// Load the Intl polyfill and required locale data

const locale = document.documentElement.getAttribute('lang')

// load the Intl polyfill and its locale data before rendering the application
international.load_polyfill(locale)
	.then(international.load_locale_data.bind(null, locale))
	.then(() =>
	{
		// international
		const localized_messages = window._localized_messages
		delete window._localized_messages

		// create Redux store
		const store = create_store(new api_client(), window._flux_store_data)
		delete window._flux_store_data

		// since react-intl assumes Intl is already in the global scope, 
		// we can't import the routes (which imports react-intl in some of its components) 
		// before polyfilling Intl. That's why you see require("./routes") here, 
		// and not as import on the top of the file.
		const routes = require('./routes')

		const content_container = document.getElementById('content')

		client
		({
			development       : _development_,
			wrap_component    : component =>
			{
				if (!_development_tools_)
				{
					return markup_wrapper(component, { store, locale, messages: localized_messages })
				}

				// Render dev tools after initial client render to prevent warning
				// "React attempted to reuse markup in a container but the checksum was invalid"
				// https://github.com/erikras/react-redux-universal-hot-example/pull/210

				ReactDOM.render(markup_wrapper(component, { store, locale, messages: localized_messages }), content_container)

				console.log(`You are gonna see a warning about "React.findDOMNode is deprecated" in the console. It's normal: redux_devtools hasn't been updated to React 0.14 yet`)

				const markup =
				(
					<div>
						{markup_wrapper(component, { store, locale, messages: localized_messages })}
						<dev_tools/>
					</div>
				)

				return markup
			},
			routes            : routes({ store }),
			// history           : create_history(),
			content_container
		})
	})

window.debug = (...parameters) => { console.log.bind(console)(parameters) }