import language from '../code/language'

import webpack                    from 'webpack'
import webpack_development_server from 'webpack-dev-server'
import webpack_isomorphic_tools   from 'webpack-isomorphic-tools'
import base_configuration         from './webpack.config'

import application_configuration  from '../code/server/configuration'
const websocket_url = `${application_configuration.webserver.http.host}:${application_configuration.webserver.http.port}`

// process.env.UV_THREADPOOL_SIZE = 100

const configuration = Object.clone(base_configuration)

configuration.devtool = 'inline-source-map'
// configuration.devtool = 'eval-source-map'
// configuration.devtool = 'eval-cheap-module-source-map'

configuration.plugins = configuration.plugins.concat
(
	// environment variables
	new webpack.DefinePlugin
	({
		'process.env': { NODE_ENV: JSON.stringify('development') },

		_websocket_url_: JSON.stringify(websocket_url),

		_client_      : true,
		_server_      : false,
		_production_  : false,
		_development_ : true,
		_devtools_    : true  // <-------- DISABLE redux-devtools HERE
	}),

	// faster code reload on changes
	new webpack.HotModuleReplacementPlugin(),

	// webpack.NoErrorsPlugin is an optional plugin 
	// that tells the reloader to not reload if there is a syntax error in your code. 
	// The error is simply printed in the console, and the component will reload 
	// when you fix the error.
	new webpack.NoErrorsPlugin()
)

// enable webpack development server
configuration.entry.main = 
[
	`webpack-dev-server/client?http://${application_configuration.development.webpack.development_server.host}:${application_configuration.development.webpack.development_server.port}`,
	'webpack/hot/only-dev-server',
	configuration.entry.main
]

// network path for static files: fetch all statics from webpack development server
configuration.output.publicPath = `http://${application_configuration.development.webpack.development_server.host}:${application_configuration.development.webpack.development_server.port}${configuration.output.publicPath}`

new webpack_isomorphic_tools(configuration,
{
	development : true,
	assets      : configuration.assets
})

// add react-hot-loader to react components' loaders
configuration.module.loaders.filter(loader =>
{
	return loader.test.toString() === configuration.regular_expressions.javascript.toString()
})
.first()
.loaders.unshift('react-hot')

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

const compiler = webpack(configuration, function(error, stats)
{
	var json = stats.toJson()
	if (json.errors.length)
	{
		console.error(json.errors[0])
	}
})

const development_server = new webpack_development_server(compiler, development_server_options)

development_server.listen(application_configuration.development.webpack.development_server.port, '0.0.0.0', (error) =>
{
	if (error) 
	{
		console.error(error.stack || error)
		throw error
	}

	console.log('[webpack-dev-server] Running') // , `http://localhost:${application_configuration.development.webpack.development_server.port}/webpack-dev-server/index.html`)
})