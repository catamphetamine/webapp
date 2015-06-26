// See example gulpfile.js for file system development build:
// https://github.com/webpack/webpack-with-common-libs/blob/master/gulpfile.js

import gulp from 'gulp'
import gulp_utilities from 'gulp-util'
import webpack from	'webpack'
import WebpackDevServer from 'webpack-dev-server'
import webpack_configuration_file from './webpack.config'
// coffee                     = require 'gulp-coffee'
// server                     = require 'gulp-develop-server'
import nodemon from 'gulp-nodemon'

import application_configuration from './server/configuration'

// Default task
gulp.task('default', ['webpack-dev-server'])

// Clone webpack configuration
const webpack_configuration = () =>
{
	// в случае с i18n plugin
	// if (webpack_configuration_file instanceof Array)
	// {
	// 	webpack_configuration_file = webpack_configuration_file[0]
	// }

	const configuration = Object.create(webpack_configuration_file)

	const websocket_url = `${application_configuration.webserver.http.host}:${application_configuration.webserver.http.port}`
	
	configuration.plugins = configuration.plugins.concat(
		new webpack.DefinePlugin
		({
			// https://github.com/petehunt/webpack-howto
			// BUILD_DEV=1 BUILD_PRERELEASE=1 webpack
			'_production_': JSON.stringify(JSON.parse(process.env.BUILD_DEV || 'true')),
			'_prerelease_': JSON.stringify(JSON.parse(process.env.BUILD_PRERELEASE || 'false')),
			'_websocket_url_': JSON.stringify(websocket_url)
		})
	)

	return configuration
}

// ############################################################
// Development build
// ############################################################
gulp.task('webpack-dev-server', ['server:start'], (callback) =>
{
	const configuration = webpack_configuration()

	configuration.debug = true
	configuration.devtool = 'eval-cheap-module-source-map'

	configuration.plugins = configuration.plugins.concat(
		new webpack.DefinePlugin
		({
			'process.env': { NODE_ENV: JSON.stringify('development') },
			// '_production_': JSON.stringify(JSON.parse(process.env.BUILD_DEV || 'true'))
			'__production__': false
		}),
		// new webpack.HotModuleReplacementPlugin(),
		new webpack.NoErrorsPlugin()
	)

	// Start a webpack-dev-server
	new WebpackDevServer(webpack(configuration),
	{
		// contentBase: './build/client'
		// proxy:
		// 	"*": "http://localhost:#{application_configuration.webserver.http.port}"
		// hot: yes
		headers: { "Access-Control-Allow-Origin": "*" },
		quiet: false,
		noInfo: false,
		// lazy: false
		watchDelay: 300,
		historyApiFallback: true,
		stats:
		{
			colors: true
		}
	})

	.listen(application_configuration.development.webpack.development_server.port, 'localhost', (error) =>
	{
		if (error) 
		{
			throw new gulp_utilities.PluginError('webpack-dev-server', error)
		}

		gulp_utilities.log('[webpack-dev-server]', `http://localhost:${application_configuration.development.webpack.development_server.port}/webpack-dev-server/index.html`)
	})
})

// ############################################################
// Production build
// ############################################################
gulp.task('build', ['webpack:build'])

gulp.task('webpack:build', (callback) =>
{
	const configuration = webpack_configuration()

	configuration.devtool = 'source-map'

	configuration.plugins = configuration.plugins.concat(
		new webpack.DefinePlugin
		({
			'process.env': { NODE_ENV: JSON.stringify('production') },
			// '_production_': JSON.stringify(JSON.parse(process.env.BUILD_DEV || 'true'))
			'__production__': true
		}),
		new webpack.optimize.DedupePlugin(),
		new webpack.optimize.UglifyJsPlugin()
		// new webpack.optimize.MinChunkSizePlugin({minChunkSize: 10000})
	)

	// run webpack
	webpack(configuration, (error, stats) =>
	{
		// assets = stats.compilation.assets
		// console.log(assets['common.js'])

		// console.log(stats.hash)

		if (error)
		{
			throw new gulp_utilities.PluginError('webpack:build', error)
		}

		gulp_utilities.log('[webpack:build]', stats.toString({ colors: true }))
		callback()
	})
})

gulp.task('server:start', () => 
{
	nodemon(require('./nodemon.json'))
	// .on('restart', -> )
})
