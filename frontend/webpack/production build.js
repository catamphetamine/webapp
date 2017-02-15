import language from '../../code/language'
import path     from 'path'

import webpack             from 'webpack'
import base_configuration  from './webpack.config'
import clean_plugin        from 'clean-webpack-plugin'
import extract_text_plugin from 'extract-text-webpack-plugin'

import webpack_isomorphic_tools_plugin from 'webpack-isomorphic-tools/plugin'

import application_configuration from '../../code/configuration'

const configuration = Object.clone(base_configuration)

configuration.devtool = 'cheap-module-source-map'

configuration.output.filename      = configuration.output.filename.replace('[hash]', '[chunkhash]')
configuration.output.chunkFilename = configuration.output.chunkFilename.replace('[hash]', '[chunkhash]')

configuration.plugins = configuration.plugins.concat
(
	// clears the output folder
	new clean_plugin([path.relative(configuration.context, configuration.output.path)],
	{
		root: configuration.context
	}),

	// environment variables
	new webpack.DefinePlugin
	({
		'process.env':
		{
			// Useful to reduce the size of client-side libraries, e.g. react
			NODE_ENV: JSON.stringify('production') // 'development' to see non-minified React errors
		},

		_development_tools_ : false // `redux-devtools` on/off
	}),

	// css files from the extract-text-plugin loader
	// (for more information see the extract_text_plugin code for scss_loader below)
	//
	// the "allChunks: true" option means that this extracted file will contain
	// the styles from all chunks of an entry (each entry can be divided into chunks).
	// without this option styles would only be extracted from the top-level chunk of an entry.
	new extract_text_plugin({ filename: '[name]-[contenthash].css', allChunks: true }),

	// For production mode
	// https://moduscreate.com/webpack-2-tree-shaking-configuration/
	new webpack.LoaderOptionsPlugin
	({
		minimize: true,
		debug: false
	}),

	// Compresses javascript files
	new webpack.optimize.UglifyJsPlugin
	({
		compress:
		{
			warnings: false
		}
	}),

	new webpack_isomorphic_tools_plugin(require('./webpack-isomorphic-tools.js'))
)

// find the styles loader
const scss_loader = configuration.module.rules.filter(loader =>
{
	return loader.test.toString() === /\.(scss|css)$/.toString()
})
.first()

// https://github.com/webpack/extract-text-webpack-plugin
//
// It moves every require("style.css") in entry chunks into a separate css output file.
// So your styles are no longer inlined into the javascript, but separate
// in a css bundle file (styles.css). If your total stylesheet volume is big,
// it will be faster because the stylesheet bundle is loaded in parallel to the javascript bundle.
// (but it also disables hot module reload)
//
// the first argument to the .extract() function is the name of the loader
// ("style-loader" in this case) to be applied to non-top-level-chunks in case of "allChunks: false" option.
// since in this configuration "allChunks: true" option is used, this first argument is irrelevant.
scss_loader.use = extract_text_plugin.extract({ fallback: scss_loader.use.shift(), use: scss_loader.use })

export default configuration