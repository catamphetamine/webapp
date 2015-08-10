import React, {Component, PropTypes} from 'react'
import serialize from 'serialize-javascript'

// const cdn = '//cdnjs.cloudflare.com/ajax/libs/'

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
		assets    : PropTypes.object,
		component : PropTypes.object,
		store     : PropTypes.object
	}

	render()
	{
		const { assets, component, store } = this.props
		
		const title = 'Cinema'
		const description = 'Workflow'

		const html = 
		(
			<html lang="en-us">
				<head>
					<meta charSet="utf-8"/>
					<title>{title}</title>

					<meta property="og:site_name" content={title}/>
					{/* <meta property="og:image" content={image}/> */}
					<meta property="og:locale" content="en_US"/>
					<meta property="og:title" content={title}/>
					<meta property="og:description" content={description}/>
					<meta name="twitter:card" content="summary"/>

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
					<div id="content" dangerouslySetInnerHTML={{__html: React.renderToString(component)}}/>

					{/* Flux store data will be reloaded into the store on the client */}
					<script dangerouslySetInnerHTML={{__html: `window._flux_store_data=${serialize(store.getState())};`}} />

					{/* You can uncomment this for debugging your assets */}
					{/*<pre>{JSON.stringify(assets, null, 2)}</pre>*/}

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