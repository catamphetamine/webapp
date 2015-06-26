var webpack = require('webpack')
var path    = require('path')

var configuration = require('./server/configuration')

// с i18n plugin непонятно: видимо, нет возможности переключать язык на лету, 
// поэтому, видимо, придётся писать своё решение

// I18nPlugin = require 'i18n-webpack-plugin'

// languages =
//   ru_RU: require('./sources/client/translation/ru_RU.json')
//   en_US: null

// module.exports = Object.keys(languages).map (language) ->

var HtmlWebpackPlugin = require('html-webpack-plugin')

var path_to_react = path.resolve(__dirname, 'node_modules/react/dist/react.min.js')

var third_party = 
[
	'react/dist/react.min.js',
	'react-router/dist/react-router.min.js',
	'moment/min/moment.min.js',
	'underscore/underscore-min.js'
]

module.exports =
{
	// for bower
	// resolve:
	// 	root: [path.join(__dirname, "bower_components")]

	// name: language

	entry:
	{
		// массив из трёх строк требуется для react-hot-loader
		// webpack-dev-server/client?http://0.0.0.0:...
		application: 
		[
			// "webpack-dev-server/client?http://127.0.0.1:#{configuration.development.webpack.development_server.port}",
			// 'webpack/hot/only-dev-server',
			'./client/application.react'
		]
	},

	output: 
	{
		path: path.resolve(__dirname, 'build', 'client'),
		publicPath: '/',
		// publicPath: 'http://mycdn.com/'
		// filename: "[name].#{language}.js"
		filename: "[name].[hash].js",
		// filename: 'bundle.js'
    	// chunkFilename: "[id].bundle.js"
		sourceMapFilename: '[file].map'
	},

	module:
	{
		loaders: 
		[
			{ 
				test: /\.css$/,
				loaders: ['style', 'css'] 
			},
			{ 
				test: /\.coffee$/,
				loader: 'coffee' 
			},
			{ 
				test: /\.react$/,
				loaders: ['babel'] // ['coffee', 'cjsx'] // ['react-hot',  // 'jsx?harmony'
			},
			{
				test: /\.jsx?$/,
				// exclude: /(node_modules|bower_components)/,
				include: [
					path.resolve(__dirname, 'client'),
					path.resolve(__dirname, 'node_modules', 'react-absolute-grid')
				],
				loader: 'babel'
			},
			{ 
				test: /\.react.page$/,
				loaders: ['react-router-proxy', 'babel'] // ['react-router-proxy', 'react-hot', // 'jsx?harmony'
			},
			{ 
				test: /\.less$/,
				loaders: ['style', 'css', 'less'] 
			},
			{ 
				test: /\.(png|jpg)$/,
				loader: 'url?limit=8192' // inline base64 URLs for <=8k images, direct URLs for the rest
			},
			{
				test: /\.(png|woff|woff2|eot|ttf|svg)$/,
				loader: 'url-loader?limit=100000' // Any png-image or woff-font below or equal to 100K will be converted to inline base64 instead
			}
		]
	},

	resolve:
	{
		// you can now require('file') instead of require('file.coffee')
		extensions: ['', '.js', '.json', '.coffee', '.react', '.less'],
		modulesDirectories: ['build', 'libraries', 'bower_components', 'node_modules']
	},

	plugins: 
	[
		new webpack.optimize.CommonsChunkPlugin('common', 'common.[hash].js'),
		new webpack.optimize.OccurenceOrderPlugin(true),
		new HtmlWebpackPlugin({ template: './client/index.html' })
		// new I18nPlugin(languages[language])

	    // new webpack.HotModuleReplacementPlugin()

		// for bower
		// new webpack.ResolverPlugin(
		// 	new webpack.ResolverPlugin.DirectoryDescriptionFilePlugin("bower.json", ["main"])
		// )
	]
}

module.exports.resolve = module.exports.resolve || {}
module.exports.resolve.alias = module.exports.resolve.alias || {}
module.exports.module.noParse = module.exports.module.noParse || []

// Run through deps and extract the first part of the path, 
// as that is what you use to require the actual node modules 
// in your code. Then use the complete path to point to the correct
// file and make sure webpack does not try to parse it
for (let dependency of third_party)
{
	const dependency_path = path.resolve(__dirname, 'node_modules', dependency)
	module.exports.resolve.alias[dependency.split(path.sep)[0]] = dependency_path
	module.exports.module.noParse.push(dependency_path)
}