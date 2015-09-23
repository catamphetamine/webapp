import language from '../code/language'

import express from 'express'

import webpack                         from 'webpack'
// import webpack_development_server      from 'webpack-dev-server'
import webpack_isomorphic_tools_plugin from 'webpack-isomorphic-tools/plugin'
import base_configuration              from './webpack.config'

import application_configuration from '../code/configuration'
const websocket_url = `${application_configuration.webserver.http.host}:${application_configuration.webserver.http.port}`

const configuration = Object.clone(base_configuration)

configuration.devtool = 'inline-source-map'
// configuration.devtool = 'eval-source-map'
// configuration.devtool = 'eval-cheap-module-source-map'

configuration.plugins = configuration.plugins.concat
(
	// environment variables
	new webpack.DefinePlugin
	({
		'process.env':
		{
			NODE_ENV: JSON.stringify('development'),
			BABEL_ENV: JSON.stringify('development/client')
		},

		_websocket_url_: JSON.stringify(websocket_url),

		_client_            : true,
		_server_            : false,
		_production_        : false,
		_development_       : true,
		_development_tools_ : true  // <-------- DISABLE redux-devtools HERE
	}),

	// faster code reload on changes
	new webpack.HotModuleReplacementPlugin(),

	// // webpack.NoErrorsPlugin is an optional plugin 
	// // that tells the reloader to not reload if there is a syntax error in your code. 
	// // The error is simply printed in the console, and the component will reload 
	// // when you fix the error.
	// new webpack.NoErrorsPlugin(),

	new webpack_isomorphic_tools_plugin(require('./isomorphic.js')).development()
)

// enable webpack development server
configuration.entry.main = 
[
	// `webpack-dev-server/client?http://${application_configuration.development.webpack.development_server.host}:${application_configuration.development.webpack.development_server.port}`,
	// 'webpack/hot/only-dev-server',
	`webpack-hot-middleware/client?path=http://${application_configuration.development.webpack.development_server.host}:${application_configuration.development.webpack.development_server.port}/__webpack_hmr`,
	configuration.entry.main
]

// network path for static files: fetch all statics from webpack development server
configuration.output.publicPath = `http://${application_configuration.development.webpack.development_server.host}:${application_configuration.development.webpack.development_server.port}${configuration.output.publicPath}`

// // add react-hot-loader to react components' loaders
const javascript_loader = configuration.module.loaders.filter(loader =>
{
	return loader.test.toString() === configuration.regular_expressions.javascript.toString()
})
.first()
// .loaders.unshift('react-hot')

javascript_loader.query = javascript_loader.query || {}

javascript_loader.query.plugins = javascript_loader.query.plugins || []
javascript_loader.query.plugins.push('react-transform')

extend(javascript_loader.query,
{
	extra:
	{
		'react-transform':
		[{
			target  : 'react-transform-hmr',
			imports : ['react'],
			locals  : ['module']
		}]
	}
})

// proxy:
// {
// 	"/api/*": `http://localhost:${application_configuration.webserver.http.port}`
// }

// http://webpack.github.io/docs/webpack-dev-server.html
const development_server_options = 
{
	// don't know what that it
	// contentBase : `http://${application_configuration.webserver.http.host}:${application_configuration.webserver.http.port}`,
	// seems to be wrong
	// contentBase : `http://${application_configuration.development.webpack.development_server.host}:${application_configuration.development.webpack.development_server.port}`,

	quiet       : true, // don’t output anything to the console
	noInfo      : true, // suppress boring information
	hot         : true, // adds the HotModuleReplacementPlugin and switch the server to hot mode. Note: make sure you don’t add HotModuleReplacementPlugin twice
	inline      : true, // also adds the webpack/hot/dev-server entry

	// You can use it in two modes:
	// watch mode (default): The compiler recompiles on file change.
	// lazy mode: The compiler compiles on every request to the entry point.
	lazy        : false, 

	// network path for static files: fetch all statics from webpack development server
	publicPath  : configuration.output.publicPath,

	headers     : { "Access-Control-Allow-Origin": "*" },
	stats       : { colors: true }
}

const compiler = webpack(configuration)

// const development_server = new webpack_development_server(compiler, development_server_options)

const development_server = new express()

development_server.use(require('webpack-dev-middleware')(compiler, development_server_options))
development_server.use(require('webpack-hot-middleware')(compiler))

development_server.listen(application_configuration.development.webpack.development_server.port, (error) =>
{
	if (error) 
	{
		console.error(error.stack || error)
		throw error
	}

	console.log('[webpack-dev-server] Running') // , `http://localhost:${application_configuration.development.webpack.development_server.port}/webpack-dev-server/index.html`)
})