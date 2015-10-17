import React, { Component, PropTypes } from 'react'
import ReactDOMServer from 'react-dom/server'

import { server_generated_webpage_head } from './webpage head'

import serialize from 'serialize-javascript'

/**
 * Wrapper component containing HTML metadata and boilerplate tags.
 * Used in server-side code only to wrap the string output of the
 * rendered route component.
 *
 * The only thing this component doesn't (and can't) include is the
 * HTML doctype declaration, which is added to the rendered output
 * by the server.js file.
 */
export default class Html extends Component
{
	static propTypes =
	{
		locale    : PropTypes.string.isRequired,
		messages  : PropTypes.object.isRequired,
		assets    : PropTypes.object.isRequired,
		component : PropTypes.node,
		store     : PropTypes.object.isRequired
	}

	render()
	{
		const { locale, messages, assets, component, store } = this.props
		
		// const title = 'Webapp'

		// get the favicon (this code will run on server)
		const required_assets = Html.require_assets()

		// when server-side rendering is disabled, component will be undefined
		// (but server-side rendering is always on so this code may be removed)
		const content = component ? ReactDOMServer.renderToString(component) : ''

		const html = 
		(
			<html lang={locale}>
				<head>
					{server_generated_webpage_head()}

					{/* favicon */}
					<link rel="shortcut icon" href={required_assets.icon}/>

					{/* use this icon font instead: https://www.google.com/design/icons/ */}
					{/*<link href={cdn + 'font-awesome/4.3.0/css/font-awesome.min.css'}
								media="screen, projection" rel="stylesheet" type="text/css" />*/}

					{/* styles (will be present only in production with webpack extract text plugin) */}
					{Object.keys(assets.styles).map((style, i) =>
						<link href={assets.styles[style]} key={i} media="screen, projection"
							rel="stylesheet" type="text/css"/>
					)}
				</head>

				<body>
					{/* rendered React page */}
					<div id="content" dangerouslySetInnerHTML={{__html: content}}/>

					{/* Flux store data will be reloaded into the store on the client */}
					<script dangerouslySetInnerHTML={{__html: `window._flux_store_data=${serialize(store.getState())};`}} />

					{/* React-intl messages */}
					<script dangerouslySetInnerHTML={{__html: `window._localized_messages=${serialize(messages)};`}} />

					{/* javascripts */}

					{/* a "common.js" chunk (see webpack extract commons plugin) */}
					<script src={assets.javascript.common}/>
					
					{/* current application entry javascript */}
					{/* (i guess there's always only one of them, e.g. "main.js") */}
					{Object.keys(assets.javascript).filter(script => script !== 'common')
					.map((script, i) =>
						<script src={assets.javascript[script]} key={i}/>
					)}
				</body>
			</html>
		)

		return html
	}
}

// include these assets in webpack build
// (you'll also need to add the corresponding asset types to isomorphic.js;
//  otherwise you'll get syntax errors when requiring these files on server)
Html.require_assets = function()
{
	const result =
	{
		icon  : require('../../assets/images/icon/32x32.png'),
		style : require('../../assets/styles/style.scss')
	}

	return result
}