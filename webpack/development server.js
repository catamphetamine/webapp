// import path from 'path'
// import fs   from 'fs'

import language from '../code/common/language'

import express from 'express'

import webpack                         from 'webpack'
import webpack_isomorphic_tools_plugin from 'webpack-isomorphic-tools/plugin'
import base_configuration              from './webpack.config'

import application_configuration from '../code/common/configuration'
const websocket_url = `${application_configuration.web_server.http.host}:${application_configuration.web_server.http.port}`

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
		_development_tools_ : false  // <-------- DISABLE redux-devtools HERE
	}),

	// faster code reload on changes
	new webpack.HotModuleReplacementPlugin(),

	// // webpack.NoErrorsPlugin is an optional plugin 
	// // that tells the reloader to not reload if there is a syntax error in your code. 
	// // The error is simply printed in the console, and the component will reload 
	// // when you fix the error.
	// new webpack.NoErrorsPlugin(),

	new webpack_isomorphic_tools_plugin(require('./webpack-isomorphic-tools.js')).development()
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

// // read babel configuration
// const babelrc = JSON.parse(fs.readFileSync(path.join(__dirname, '../.babelrc')))

// // development babel configuration
// const babelrc_development = babelrc.env && babelrc.env.development || {}

// // merge global and dev-only plugins
// const combined_plugins = (babelrc.plugins || []).concat(babelrc_development.plugins)

// const babel_loader_query = Object.assign({}, babelrc_development, babelrc, { plugins: combined_plugins })
// delete babel_loader_query.env

// // Since we use .babelrc for client and server, 
// // and we don't want HMR enabled on the server, 
// // we have to add the babel plugin react-transform-hmr manually here.

// // find react-transform plugin if already present
// let react_transform = null
// for (let plugin of babel_loader_query.plugins)
// {
// 	if (Array.isArray(plugin) && plugin[0] === 'react-transform')
// 	{
// 		react_transform = plugin

// 		if (!react_transform[1] || !react_transform[1].transforms)
// 		{
// 			react_transform[1] = Object.assign({}, react_transform[1], {transforms: []})
// 		}
// 	}
// }

// // if not react-transform plugin is already present, create it
// if (!react_transform)
// {
// 	react_transform = ['react-transform', { transforms: [] }]
// 	babel_loader_query.plugins.push(react_transform)
// }

// // enable React .render() errors display
// react_transform[1].transforms.push
// ({
// 	"transform" : "react-transform-catch-errors",
// 	"imports"   : ["react", "redbox-react"]
// })

// // enable `react-transform-hmr`
// react_transform[1].transforms.push
// ({
// 	transform : 'react-transform-hmr',
// 	imports   : ['react'],
// 	locals    : ['module']
// })

const javascript_loader = configuration.module.loaders.filter(loader =>
{
	return loader.test.toString() === configuration.regular_expressions.javascript.toString()
})
.first()

// javascript_loader.query = babel_loader_query

if (!javascript_loader.query)
{
	javascript_loader.query = {}
}

if (!javascript_loader.query.plugins)
{
	javascript_loader.query.plugins = []
}

javascript_loader.query.plugins = javascript_loader.query.plugins.concat
([[
	'react-transform',
	{
		transforms: 
		[{
			transform : 'react-transform-catch-errors',
			imports   : ['react', 'redbox-react']
		},
		{
			transform : 'react-transform-hmr',
			imports   : ['react'],
			locals    : ['module']
		}]
	}
]])

// javascript_loader.query = javascript_loader.query || {}

// javascript_loader.query.plugins = javascript_loader.query.plugins || []
// javascript_loader.query.plugins.push('react-transform')

// extend(javascript_loader.query,
// {
// 	extra:
// 	{
// 		'react-transform':
// 		{
// 			transforms:
// 			[{
// 				transform : 'react-transform-hmr',
// 				imports   : ['react'],
// 				locals    : ['module']
// 			},
// 			{
// 				"transform": "react-transform-catch-errors",
				
// 				"imports":
// 				[
// 					// the first import is your React distribution
// 					// (if you use React Native, pass "react-native" instead)

// 					"react",

// 					// the second import is the React component to render error
// 					// (it can be a local path too, like "./src/ErrorReporter")

// 					"redbox-react",

// 					// the third import is OPTIONAL!
// 					// when specified, its export is used as options to the reporter.
// 					// see specific reporter's docs for the options it needs.

// 					// "./src/reporterOptions"
// 				]
// 			}]
// 		}
// 	}
// })

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