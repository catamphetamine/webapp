import 'babel-polyfill'

import language       from '../common/language'

import React          from 'react'
import ReactDOM       from 'react-dom'

import { render }     from 'react-isomorphic-render/redux'
import create_store   from './redux store'
import markup_wrapper from './markup wrapper'

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

		// a function to create Redux store
		create_store,

		// creates React-router routes
		create_routes,

		// wraps React page component into arbitrary markup (e.g. Redux Provider)
		markup_wrapper,
		// markup_wrapper: react_hot_loader_3_markup_wrapper,

		// internationalization
		load_localized_messages: international.load_translation
	})
	.then(({ rerender }) => international.hot_reload(rerender))
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