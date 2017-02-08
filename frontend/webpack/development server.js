import path from 'path'

import webpack from 'webpack'
import webpack_isomorphic_tools_plugin from 'webpack-isomorphic-tools/plugin'
import express from 'express'
import webpack_dev_middleware from 'webpack-dev-middleware'
import webpack_hot_middleware from 'webpack-hot-middleware'

import language from '../../code/language'

import base_configuration from './webpack.config'

import application_configuration from '../../code/configuration'

const configuration = Object.clone(base_configuration)

// https://webpack.js.org/configuration/devtool/#devtool
// configuration.devtool = 'cheap-module-eval-source-map'

configuration.plugins = configuration.plugins.concat
(
	// environment variables
	new webpack.DefinePlugin
	({
		_development_tools_ : false  // `redux-devtools` on/off
	}),

	// Slightly faster webpack builds
	// https://github.com/erikras/react-redux-universal-hot-example/issues/616
	new webpack.DllReferencePlugin
	({
		context  : configuration.context,
		manifest : require(path.join(configuration.output.path, 'vendor-manifest.json'))
	}),

	// faster code reload on changes
	new webpack.HotModuleReplacementPlugin(),

	// prints more readable module names in the browser console on HMR updates
	new webpack.NamedModulesPlugin(),

	// For development mode
	// https://moduscreate.com/webpack-2-tree-shaking-configuration/
	new webpack.LoaderOptionsPlugin
	({
		debug: true
	}),

	// // webpack.NoErrorsPlugin is an optional plugin
	// // that tells the reloader to not reload if there is a syntax error in your code.
	// // The error is simply printed in the console, and the component will reload
	// // when you fix the error.
	// new webpack.NoErrorsPlugin(),

	new webpack_isomorphic_tools_plugin(require('./webpack-isomorphic-tools.js')).development()
)

// Enable `webpack-dev-server` and `react-hot-loader`
configuration.entry.main =
[
	`webpack-hot-middleware/client?path=http://${application_configuration.development.webpack.development_server.host}:${application_configuration.development.webpack.development_server.port}/__webpack_hmr`,
	'react-hot-loader/patch',
	configuration.entry.main
]

// Network path for static files: fetch all statics from webpack development server
configuration.output.publicPath = `http://${application_configuration.development.webpack.development_server.host}:${application_configuration.development.webpack.development_server.port}${configuration.output.publicPath}`

// Run `webpack-dev-server`

// http://webpack.github.io/docs/webpack-dev-server.html
const development_server_options =
{
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

const development_server = new express()

development_server.use(webpack_dev_middleware(compiler, development_server_options))
development_server.use(webpack_hot_middleware(compiler))

development_server.listen(application_configuration.development.webpack.development_server.port, (error) =>
{
	if (error)
	{
		console.error(error.stack || error)
		throw error
	}

	console.log('[webpack-dev-server] Running')
})