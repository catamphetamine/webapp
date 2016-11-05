import path from 'path'
import webpack from 'webpack'

import Webpack_isomorphic_tools_plugin        from 'webpack-isomorphic-tools/plugin'
import webpack_isomorphic_tools_configuration from './webpack-isomorphic-tools'

import global_variables from '../../code/global variables'

import autoprefixer from 'autoprefixer'
import css_custom_properties from 'postcss-custom-properties'
import postcss_calc from 'postcss-calc'

const root_folder = path.resolve(__dirname, '..', '..')
const frontend_root_folder = path.resolve(__dirname, '..')

const assets_source_folder = path.resolve(frontend_root_folder, 'assets')

const webpack_isomorphic_tools_plugin = new Webpack_isomorphic_tools_plugin(webpack_isomorphic_tools_configuration)

const define_plugin_global_variables = {}
Object.keys(global_variables).forEach(function(key)
{
	define_plugin_global_variables[key] = JSON.stringify(global_variables[key])
})

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
				test    : /\.js$/,
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
				test    : /\.js$/,
				include :
				[
					path.resolve(root_folder, 'code')
				],
				loader: 'babel-loader'
			},
			{
				test    : /\.scss$/,
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

	resolve:
	{
		// An array of directory names to be resolved to the current directory
		// as well as its ancestors, and searched for modules.
		// This functions similarly to how node finds “node_modules” directories.
		modules: ['node_modules']
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

configuration.plugins.push
(
	new webpack.LoaderOptionsPlugin
	({
		test: /\.scss$/,
		debug: true,
		options:
		{
			// A temporary workaround for `scss-loader`
			// https://github.com/jtangelder/sass-loader/issues/298
			output:
			{
				path: configuration.output.path
			},

			postcss:
			[
				autoprefixer({ browsers: 'last 2 version' }),
				css_custom_properties(),
				postcss_calc()
			],

			// A temporary workaround for `css-loader`.
			// Can also supply `query.context` parameter.
			context: configuration.context
		}
	})
)

module.exports = configuration