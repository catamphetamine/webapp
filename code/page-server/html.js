import React, { Component, PropTypes } from 'react'
import ReactDOMServer from 'react-dom/server'

import { server_generated_webpage_head } from '../client/webpage head'

import serialize from 'serialize-javascript'

import html_assets from '../client/html assets'

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

		// when server-side rendering is disabled, component will be undefined
		// (but server-side rendering is always enabled so this "if" condition may be removed)
		const content = component ? ReactDOMServer.renderToString(component) : ''

		const html = 
		(
			<html lang={locale}>
				<head>
					{/* webpage title and various meta tags */}
					{server_generated_webpage_head()}

					{/* "favicon" */}
					<link rel="shortcut icon" href={html_assets.icon()}/>

					{/* use this icon font instead: https://www.google.com/design/icons/ */}
					{/*<link href={cdn + 'font-awesome/4.3.0/css/font-awesome.min.css'}
								media="screen, projection" rel="stylesheet" type="text/css" />*/}

					{/* (will be done only in production mode
					     with webpack extract text plugin) 

					    mount CSS stylesheets for all entry points

					    (currently there is only one entry point: "main";
					     and also the "common" chunk) */}
					{Object.keys(assets.styles).map((style, i) =>
						<link 
							href={assets.styles[style]} 
							key={i} 
							media="screen, projection"
							rel="stylesheet" 
							type="text/css"/>
					)}

					{/* (will be done only in development mode)

					    resolves the initial style flash (flicker) 
					    on page load in development mode 
					    (caused by Webpack style-loader mounting CSS styles 
					     through javascript after page load)
					    by mounting the entire CSS stylesheet in a <style/> tag */}
					{ Object.keys(assets.styles).is_empty() ? <style dangerouslySetInnerHTML={{__html: html_assets.style()}}/> : null }
				</head>

				<body>
					{/* rendered React page */}
					<div id="content" dangerouslySetInnerHTML={{__html: content}}/>

					{/* Flux store data will be reloaded into the store on the client */}
					<script dangerouslySetInnerHTML={{__html: `window._flux_store_data=${serialize(store.getState())}`}}/>

					{/* React-intl messages */}
					<script dangerouslySetInnerHTML={{__html: `window._localized_messages=${serialize(messages)}`}}/>

					{/* javascripts */}

					{/* the "common.js" chunk (see webpack extract commons plugin) */}
					<script src={assets.javascript.common}/>
					
					{/* current application "entry" point javascript
					    (currently there is only one entry point: "main") */}
					{Object.keys(assets.javascript)
						.filter(script => script !== 'common')
						.map((script, i) =>
							<script src={assets.javascript[script]} key={i}/>
						)
					}
				</body>
			</html>
		)

		return html
	}
}