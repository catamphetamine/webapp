var path                     = require('path')
var webpack                  = require('webpack')

var root_folder = path.resolve(__dirname, '..')

var assets_source_folder = path.resolve(root_folder, 'assets')

var Webpack_isomorphic_tools_plugin = require('webpack-isomorphic-tools/plugin')
var webpack_isomorphic_tools_configuration = require('./isomorphic')
var webpack_isomorphic_tools_plugin = new Webpack_isomorphic_tools_plugin(webpack_isomorphic_tools_configuration)

var regular_expressions =
{
	javascript : /\.js$/,
	styles     : /\.scss$/
}

var configuration =
{
	// resolve all relative paths from the project root folder
	context: root_folder,

	entry:
	{
		main: './code/client/application.js'
	},

	output: 
	{
		// filesystem path for static files
		path: path.resolve(root_folder, 'build', 'assets'),

		// network path for static files
		publicPath: '/assets/',

		// file name pattern for entry scripts
		filename: "[name].[hash].js",

		// file name pattern for chunk scripts
		chunkFilename: '[name].[chunkhash].js',

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
			{
				test    : regular_expressions.javascript,
				include :
				[
					path.resolve(root_folder, 'code', 'client'),
					path.resolve(root_folder, 'code', 'react-isomorphic-render'),
					path.resolve(root_folder, 'code', 'language.js')
				],
				loaders: ['babel-loader?stage=0&optional=runtime&plugins=typecheck']
			},
			{
				test    : regular_expressions.styles,
				include : assets_source_folder,
				loaders : 
				[
					'style-loader',
					'css-loader?importLoaders=2&sourceMap',
					'autoprefixer-loader?browsers=last 2 version',
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
				test    : /\.(woff|woff2|eot|ttf)$/,
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
			}
		]
	},

	// maybe some kind of a progress bar during compilation
	progress: true,

	resolve:
	{
		// you can now require('file') instead of require('file.coffee')
		extensions: ['', '.json', '.js']

		// // An array of directory names to be resolved to the current directory 
		// // as well as its ancestors, and searched for modules. 
		// // This functions similarly to how node finds “node_modules” directories. 
		// modulesDirectories: ['server', 'client', 'node_modules', 'web_modules']
	},

	plugins:
	[
		// extracts common javascript into a separate file
		new webpack.optimize.CommonsChunkPlugin('common', 'common.[hash].js'),

		// // Assign the module and chunk ids by occurrence count. 
		// // Ids that are used often get lower (shorter) ids. 
		// // This make ids predictable, reduces to total file size and is recommended.
		// new webpack.optimize.OccurenceOrderPlugin(true)
	]
}

module.exports = configuration

// will be used in development and production configurations
configuration.regular_expressions = regular_expressions

// var third_party = 
// [
// 	'react/dist/react.min.js',
// 	'react-router/dist/react-router.min.js',
// 	'moment/min/moment.min.js',
// 	'underscore/underscore-min.js'
// ]
//
// configuration.resolve = configuration.resolve || {}
// configuration.resolve.alias = configuration.resolve.alias || {}
// configuration.module.noParse = configuration.module.noParse || []
//
// // Run through deps and extract the first part of the path, 
// // as that is what you use to require the actual node modules 
// // in your code. Then use the complete path to point to the correct
// // file and make sure webpack does not try to parse it
// for (let dependency of third_party)
// {
// 	const dependency_path = path.resolve(root_folder, 'node_modules', dependency)
// 	configuration.resolve.alias[dependency.split(path.sep)[0]] = dependency_path
// 	configuration.module.noParse.push(dependency_path)
// }