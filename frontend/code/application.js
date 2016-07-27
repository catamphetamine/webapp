// The polyfill will emulate a full ES6 environment (for old browsers)
// (including generators, which means async/await)
import 'babel-polyfill'

import language       from '../../code/language'

import React          from 'react'
import ReactDOM       from 'react-dom'

import { render }     from 'react-isomorphic-render/redux'
import common         from './react-isomorphic-render'

// include these assets in webpack build (styles, images)

import html_assets from './html assets'

for (let asset of Object.keys(html_assets))
{
	html_assets[asset]()
}

import inject_tap_event_plugin from 'react-tap-event-plugin'

// Needed for onTouchTap
// Can go away when react 1.0 release
// Check this repo:
// https://github.com/zilverline/react-tap-event-plugin
inject_tap_event_plugin()

// import ajax from './tools/ajax'
// global.ajax = ajax

import international from './international/loader'

// // react-hot-loader 3
// import { AppContainer } from 'react-hot-loader'
//
// class react_hot_loader_3_markup_wrapper extends React.Component
// {
// 	render()
// 	{
// 		return <AppContainer component={markup_wrapper} props={this.props}/>
// 	}
// }

// load the Intl polyfill and its locale data before rendering the application
international.load().then(() =>
{
	// since react-intl assumes Intl is already in the global scope, 
	// we can't import the routes (which imports react-intl in some of its components) 
	// before polyfilling Intl. That's why you see require("./routes") here, 
	// and not as import on the top of the file.
	const create_routes = require('./routes')

	// renders the webpage on the client side
	return render
	({
		// enable/disable development mode (true/false)
		development: _development_,

		// enable/disable Redux dev-tools (true/false)
		development_tools: _development_tools_,

		// internationalization
		load_translation: international.load_translation
	},
	common)
	.then(({ component, store, rerender }) => international.hot_reload(rerender))
})

// // react-hot-loader 3
// if (module.hot)
// {
// 	module.hot.accept('./markup wrapper', () =>
// 	{
// 		render
// 		(
// 			<AppContainer
// 				component={require('./markup wrapper').default}
// 				props={{ store }}/>,
// 			document.getElementById('root')
// 		)
// 	})
// }