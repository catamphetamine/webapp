import path from 'path'
import webpack from 'webpack'

import Webpack_isomorphic_tools_plugin        from 'webpack-isomorphic-tools/plugin'
import webpack_isomorphic_tools_configuration from './webpack-isomorphic-tools'

import global_variables from '../../code/global variables'

import autoprefixer from 'autoprefixer'
import css_custom_properties from 'postcss-custom-properties'

const root_folder = path.resolve(__dirname, '..', '..')
const frontend_root_folder = path.resolve(__dirname, '..')

const assets_source_folder = path.resolve(frontend_root_folder, 'assets')

const webpack_isomorphic_tools_plugin = new Webpack_isomorphic_tools_plugin(webpack_isomorphic_tools_configuration)

const define_plugin_global_variables = {}
Object.keys(global_variables).forEach(function(key)
{
	define_plugin_global_variables[key] = JSON.stringify(global_variables[key])
})

const regular_expressions =
{
	javascript : /\.js$/,
	styles     : /\.scss$/
}

const configuration =
{
	// resolve all relative paths from the project root folder
	context: frontend_root_folder,

	entry:
	{
		main: './code/application.entry.js'
	},

	output: 
	{
		// filesystem path for static files
		path: path.resolve(frontend_root_folder, 'build/assets'),

		// network path for static files
		publicPath: '/assets/',

		// file name pattern for entry scripts
		filename: '[name].[hash].js',

		// file name pattern for chunk scripts
		chunkFilename: '[name].[hash].js',

		// sourceMapFilename: '[file].map'
	},

	module:
	{
		loaders: 
		[
			{
				test   : /\.json$/,
				loader : 'json-loader'
			},
			// This loader will be enhanced with `react-transform-hmr`
			{
				test    : regular_expressions.javascript,
				include :
				[
					path.resolve(frontend_root_folder, 'code')
				],
				loader: 'babel-loader',
				query:
				{
					// currently Relay is not used in this project
					// plugins: [path.resolve(root_folder, 'code/relay/babel_relay_plugin')]
				}
			},
			// This loader won't be enhanced with `react-transform-hmr`
			{
				test    : regular_expressions.javascript,
				include :
				[
					path.resolve(root_folder, 'code')
				],
				loader: 'babel-loader'
			},
			{
				test    : regular_expressions.styles,
				include : assets_source_folder,
				loaders : 
				[
					'style-loader',
					'css-loader?importLoaders=2&sourceMap',
					'postcss-loader',
					'sass-loader?outputStyle=expanded&sourceMap=true&sourceMapContents=true'
				]
			},
			// {
			// 	test    : Webpack_isomorphic_tools_plugin.regular_expression(['woff', 'woff2', 'eot', 'ttf'].concat(webpack_isomorphic_tools_configuration.assets.images.extensions)),
			// 	include : assets_source_folder,
			// 	loaders : 
			// 	[
			// 		'url-loader?limit=10240' // Any png-image or woff-font below or equal to 10K will be converted to inline base64 instead
			// 	]
			// },
			{
				test    : webpack_isomorphic_tools_plugin.regular_expression('fonts'),
				include : assets_source_folder,
				loaders : 
				[
					'url-loader?limit=10240' // Any png-image or woff-font below or equal to 10K will be converted to inline base64 instead
				]
			},
			{
				test    : webpack_isomorphic_tools_plugin.regular_expression('images'),
				include : assets_source_folder,
				loaders : 
				[
					'url-loader?limit=10240' // Any png-image or woff-font below or equal to 10K will be converted to inline base64 instead
				]
			},
			{
				test    : webpack_isomorphic_tools_plugin.regular_expression('html'),
				include : assets_source_folder,
				loader  :  'file-loader'
			}
		]
	},

	// maybe some kind of a progress bar during compilation
	progress: true,

	postcss: () => [autoprefixer({ browsers: 'last 2 version' }), css_custom_properties()],

	resolve:
	{
		// you can now require('file') instead of require('file.coffee')
		extensions: ['', '.json', '.js'],

		// An array of directory names to be resolved to the current directory 
		// as well as its ancestors, and searched for modules. 
		// This functions similarly to how node finds “node_modules” directories. 
		modulesDirectories: ['node_modules']
	},

	plugins:
	[
		// // extracts common javascript into a separate file
		// // (use [contenthash] in production)
		// new webpack.optimize.CommonsChunkPlugin('common', 'common.[hash].js'),

		// global variables
		new webpack.DefinePlugin(define_plugin_global_variables)
	]
}

module.exports = configuration

// will be used in development and production configurations
configuration.regular_expressions = regular_expressions