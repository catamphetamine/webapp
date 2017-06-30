import path from 'path'
import webpack from 'webpack'

import Webpack_isomorphic_tools_plugin        from 'webpack-isomorphic-tools/plugin'
import webpack_isomorphic_tools_configuration from './webpack-isomorphic-tools'

// Application configuration variables
import global_variables from '../../code/global variables'

const root_folder = path.resolve(__dirname, '..', '..')
const frontend_root_folder = path.resolve(__dirname, '..')

const assets_source_folder = path.resolve(frontend_root_folder, 'assets')

const webpack_isomorphic_tools_plugin = new Webpack_isomorphic_tools_plugin(webpack_isomorphic_tools_configuration)

// Populate variables from application configuration
const define_plugin_global_variables = {}
Object.keys(global_variables).forEach(function(key)
{
	define_plugin_global_variables[key] = JSON.stringify(global_variables[key])
})

const configuration =
{
	// resolve all relative paths from the project root folder
	context: frontend_root_folder,

	// Each "entry" can be divided into multiple chunks.
	// Why multiple "entries" might be used?
	// For example, for completely different website parts,
	// like the public user-facing part and the private "admin" part.
	entry:
	{
		// The "main" entry
		main: './code/application.entry.js'
	},

	output:
	{
		// Filesystem path for static files
		path: path.resolve(frontend_root_folder, 'build/assets'),

		// Network path for static files
		publicPath: '/assets/',

		// Specifies the name of each output entry file
		filename: '[name].[hash].js',

		// Specifies the name of each (non-entry) chunk file
		chunkFilename: '[name].[hash].js'
	},

	module:
	{
		rules:
		[
			// This loader will be enhanced with `react-transform-hmr`
			{
				test    : /\.js$/,
				include :
				[
					path.resolve(frontend_root_folder, 'code')
				],
				use :
				[{
					loader: 'babel-loader'
				}]
			},
			// This loader won't be enhanced with `react-transform-hmr`
			{
				test    : /\.js$/,
				include :
				[
					path.resolve(root_folder, 'code')
				],
				use :
				[{
					loader: 'babel-loader'
				}]
			},
			{
				test    : /\.(scss|css)$/,
				use     :
				[{
					loader : 'style-loader'
				},
				{
					loader : 'css-loader',
					options:
					{
						importLoaders : 2,
						sourceMap     : true
					}
				},
				{
					loader : 'postcss-loader',
					options:
					{
						sourceMap : true
					}
				},
				{
					loader : 'sass-loader',
					options:
					{
						outputStyle       : 'expanded',
						sourceMap         : true,
						sourceMapContents : true
					}
				}]
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
				use     :
				[{
					loader : 'url-loader',
					options:
					{
						limit: 10240 // Any png-image or woff-font below or equal to 10K will be converted to inline base64 instead
					}
				}]
			},
			{
				test    : webpack_isomorphic_tools_plugin.regular_expression('images'),
				include : assets_source_folder,
				use     :
				[{
					loader : 'url-loader',
					options:
					{
						limit: 10240 // Any png-image or woff-font below or equal to 10K will be converted to inline base64 instead
					}
				}]
			},
			{
				test: /\.md$/,
				use:
				[{
					loader: 'html-loader'
				},
				{
					loader: 'markdown-loader'
				}]
			},
			{
				test: /\.svg$/,
				use:
				[{
					loader: 'babel-loader'
				},
				{
					loader: 'react-svg-loader',
					// For `svg-react-loader`:
					// titleCaseDelim: /\s+/g
					// (https://github.com/jhamlet/svg-react-loader/issues/72)
				}]
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

module.exports = configuration