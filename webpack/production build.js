import language from './../client/scripts/libraries/language'
import path     from 'path'

import webpack             from 'webpack'
import base_configuration  from './webpack.config'
import write_stats         from './plugins/write stats'
import clean_plugin        from 'clean-webpack-plugin'
import extract_text_plugin from 'extract-text-webpack-plugin'
import strip               from 'strip-loader'

import application_configuration from './../server/configuration'
const websocket_url = `${application_configuration.webserver.http.host}:${application_configuration.webserver.http.port}`

const configuration = Object.clone(base_configuration)

configuration.devtool = 'source-map'

configuration.plugins = configuration.plugins.concat
(
	// clears the output folder
	new clean_plugin([path.relative(__dirname, configuration.output.path)]),

	// environment variables
	new webpack.DefinePlugin
	({
		'process.env':
		{
			// Useful to reduce the size of client-side libraries, e.g. react
			NODE_ENV: JSON.stringify('production')
		},

		_websocket_url_: JSON.stringify(websocket_url),

		_client_      : true,
		_server_      : false,
		_development_ : false,
		_production_  : true,
		_devtools_    : false  // <-------- DISABLE redux-devtools HERE
	}),

	// css files from the extract-text-plugin loader
	new ExtractTextPlugin('[name]-[chunkhash].css', { allChunks: true }),

	// optimizations
	new webpack.optimize.DedupePlugin(),
	new webpack.optimize.OccurenceOrderPlugin(),
	new webpack.optimize.UglifyJsPlugin
	({
		compress:
		{
			warnings: false
		}
	}),

	// write webpack compiled files' names to a file
	// (this will be used later to fetch these files from server)
	function()
	{
		this.plugin('done', function(stats)
		{
			write_stats.call(this, stats, 'production')
		})
	}
)

// don't know why they write it like this
configuration.output.filename = '[name]-[chunkhash].js'

// add strip-loader to javascript loaders
configuration.module.loaders.map(loader =>
{
	return loader.test.toString() === base_configuration.regular_expressions.javascript.toString())
})
.first()
.loaders.unshift(strip.loader('debug'))

// set extract text plugin as a Css loader

const scss_loader = configuration.module.loaders.filter(loader =>
{
	return loader.test.toString() === base_configuration.regular_expressions.style.toString())
})
.first()

const style = scss_loader.loaders.shift()
const rest  = scss_loader.loaders.map(loader =>
{
	const [name, parameters] = loader.split('?')
	if (name === 'css')
	{
		return name + '?' + parameters.split('&').filter(parameter =>
		{
			return !parameter.starts_with('localIdentName=')
		})
		.join('&')
	}

	return loader
})
.join('!')

scss_loader.loaders = [extract_text_plugin.extract(style, rest)]

// done: set extract text plugin as a Css loader

export default configuration