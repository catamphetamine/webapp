import language from '../code/language'
import path     from 'path'

import webpack             from 'webpack'
import base_configuration  from './webpack.config'
import write_stats         from './plugins/write stats'
import clean_plugin        from 'clean-webpack-plugin'
import extract_text_plugin from 'extract-text-webpack-plugin'
import strip               from 'strip-loader'

import application_configuration from '../code/server/configuration'
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
	// (for more information see the extract_text_plugin code for scss_loader below)
	new extract_text_plugin('[name]-[chunkhash].css', { allChunks: true }),

	// omit duplicate modules
	new webpack.optimize.DedupePlugin(),

	// Assign the module and chunk ids by occurrence count. 
	// Ids that are used often get lower (shorter) ids. 
	// This make ids predictable, reduces to total file size and is recommended.
	new webpack.optimize.OccurenceOrderPlugin(),

	// Compresses javascript files
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
configuration.module.loaders.filter(loader =>
{
	return loader.test.toString() === base_configuration.regular_expressions.javascript.toString()
})
.first()
.loaders.unshift(strip.loader('debug'))

// begin: set extract text plugin as a Css loader

// find the styles loader
const scss_loader = configuration.module.loaders.filter(loader =>
{
	return loader.test.toString() === base_configuration.regular_expressions.styles.toString()
})
.first()

// the last loader
const style = scss_loader.loaders.shift()

// remove some of css loaders' parameters
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

// https://github.com/webpack/extract-text-webpack-plugin
//
// It moves every require("style.css") in entry chunks into a separate css output file. 
// So your styles are no longer inlined into the javascript, but separate 
// in a css bundle file (styles.css). If your total stylesheet volume is big, 
// it will be faster because the stylesheet bundle is loaded in parallel to the javascript bundle.
delete scss_loader.loaders
scss_loader.loader = extract_text_plugin.extract(style, rest)

// done: set extract text plugin as a Css loader

export default configuration