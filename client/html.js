import React, {Component, PropTypes} from 'react'
import serialize from 'serialize-javascript'

import application_configuration from '../server/configuration'

const cdn = '//cdnjs.cloudflare.com/ajax/libs/'

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
		webpackStats: PropTypes.object,
		component: PropTypes.object,
		store: PropTypes.object
	}

	render()
	{
		// let webpack_development_server = null
		//
		// if (_development_)
		// {
		// 	webpack_development_server = <script src={'http://' + application_configuration.development.webpack.development_server.host + ':' + application_configuration.development.webpack.development_server.port + '/webpack-dev-server.js'}></script>
		// }
		//
		// {webpack_development_server}

		const {webpackStats, component, store} = this.props
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

					{/*
					<meta property="twitter:site" content="@erikras"/>
					<meta property="twitter:creator" content="@erikras"/>
					<meta property="twitter:image" content={image}/>
					<meta property="twitter:image:width" content="200"/>
					<meta property="twitter:image:height" content="200"/>
					<meta property="twitter:title" content={title}/>
					<meta property="twitter:description" content={description}/>
					*/}

					{/*<link rel="shortcut icon" href="/favicon.ico" />*/}

					<link href={cdn + 'font-awesome/4.3.0/css/font-awesome.min.css'}
								media="screen, projection" rel="stylesheet" type="text/css" />

					{webpackStats.css.files.map((css, i) =>
						<link href={css} key={i} media="screen, projection"
									rel="stylesheet" type="text/css"/>)}
				</head>

				<body>
					<div id="content" dangerouslySetInnerHTML={{__html: React.renderToString(component)}}/>
					<script dangerouslySetInnerHTML={{__html: `window.__data=${serialize(store.getState())};`}} />
					
					{/*<script src={webpackStats.script[0]}/>*/}

					{/*<pre>{JSON.stringify(webpackStats, null, 2)}</pre>*/}

					{webpackStats.scripts.map((script) =>
						<script src={script[0]}/>)}
				</body>
			</html>
		)

		return html
	}
}