# See example gulpfile.js for file system development build:
# https://github.com/webpack/webpack-with-common-libs/blob/master/gulpfile.js

gulp											 = require 'gulp'
gulp_utilities						 = require 'gulp-util'
webpack										 = require 'webpack'
WebpackDevServer					 = require 'webpack-dev-server'
webpack_configuration_file = require './webpack.coffee'
# coffee                     = require 'gulp-coffee'
# server                     = require 'gulp-develop-server'
nodemon                    = require 'gulp-nodemon'

# Default task
gulp.task 'default', ['webpack-dev-server']

# Clone webpack configuration
webpack_configuration = ->
	# в случае с i18n plugin
	if webpack_configuration_file instanceof Array
		webpack_configuration_file = webpack_configuration_file[0]

	configuration = Object.create(webpack_configuration_file)

	configuration.plugins = configuration.plugins.concat(
		new webpack.DefinePlugin
			# https://github.com/petehunt/webpack-howto
			# BUILD_DEV=1 BUILD_PRERELEASE=1 webpack
			'_production_': JSON.stringify(JSON.parse(process.env.BUILD_DEV || 'true'))
			'_prerelease_': JSON.stringify(JSON.parse(process.env.BUILD_PRERELEASE || 'false'))
	)

	return configuration

############################################################
# Development build
############################################################
gulp.task 'webpack-dev-server', ['server:start'], (callback) ->
	configuration = webpack_configuration()

	configuration.debug = yes
	configuration.devtool = 'eval-cheap-module-source-map'

	configuration.plugins = configuration.plugins.concat(
		new webpack.DefinePlugin
			'process.env': { NODE_ENV: JSON.stringify('development') }
			# '_production_': JSON.stringify(JSON.parse(process.env.BUILD_DEV || 'true'))
			'__production__': no
		# new webpack.HotModuleReplacementPlugin()
		new webpack.NoErrorsPlugin()
	)

	application_configuration = require './server/configuration'

	# Start a webpack-dev-server
	new WebpackDevServer webpack(configuration),
		# contentBase: './build/client'
		proxy:
			"*": "http://localhost:#{application_configuration.webserver.http.port}"
		hot: yes
		quiet: no
		noInfo: no
		# lazy: false
		watchDelay: 300
		historyApiFallback: yes
		stats:
			colors: yes

	.listen application_configuration.development.webpack.development_server.port, 'localhost', (error) ->
		if error
			throw new gulp_utilities.PluginError('webpack-dev-server', error)

		gulp_utilities.log '[webpack-dev-server]', "http://localhost:#{application_configuration.development.webpack.development_server.port}/webpack-dev-server/index.html"

############################################################
# Production build
############################################################
gulp.task 'build', ['webpack:build']

gulp.task 'webpack:build', (callback) ->
	configuration = webpack_configuration()

	configuration.devtool = 'source-map'

	configuration.plugins = configuration.plugins.concat(
		new webpack.DefinePlugin
			'process.env': { NODE_ENV: JSON.stringify('production') }
			# '_production_': JSON.stringify(JSON.parse(process.env.BUILD_DEV || 'true'))
			'__production__': yes
		new webpack.optimize.DedupePlugin()
		new webpack.optimize.UglifyJsPlugin()
		# new webpack.optimize.MinChunkSizePlugin({minChunkSize: 10000})
	)

	# run webpack
	webpack configuration, (error, stats) ->
		# assets = stats.compilation.assets
		# console.log(assets['common.js'])

		# console.log(stats.hash)

		if error
			throw new gulp_utilities.PluginError('webpack:build', error)

		gulp_utilities.log('[webpack:build]', stats.toString(colors: yes))
		callback()

# Rest

# gulp.task 'server:watch', ['server:start'], ->
# 	gulp.watch(['src/server/**/*.js', 'src/server/**/*.coffee'], ['server:restart'])

# 	gulp.watch(['src/server/**/*.json'], ['server:restart'])
# 	gulp.watch(['src/config.json', 'src/config.default.json'], ['server:restart'])

# server_options = 
# 	path     : './server/main.coffee',
# 	execArgv : ['--harmony']

# gulp.task 'server:compile', ['server:resources'], ->
# 	event_stream.merge(
# 		gulp.src('./src/server/**/*.coffee')
# 			# Report errors but don't disconnect the stream
# 			.pipe(plumber((error) ->
# 				console.error('')
# 				console.error('===============================')
# 				console.error('CoffeeScript compilation error:')
# 				console.error('===============================')
# 				console.error('')
# 				console.error(error.message)
# 				console.error('')
# 				console.error(error.stack)
# 			))

# 			.pipe(replacement())

# 			.pipe(if build then gulp_utilities.noop() else sourcemaps.init())
# 			.pipe(coffee()),

# 		gulp.src('./src/server/**/*.js')
# 			.pipe(replacement())
# 			.pipe(if build then gulp_utilities.noop() else sourcemaps.init())
# 	)
# 	.pipe(if build then gulp_utilities.noop() else sourcemaps.write())
# 	.pipe(gulp.dest('./server'))

gulp.task 'server:start', -> # ['server:compile'], 
  nodemon(require('./nodemon.json'))
	.on('restart', ->
	# console.log('server restarted')
	)

	# server.listen server_options, (error) ->
	# 	if error
	# 		gulp_utilities.log('Server startup error:')
	# 		gulp_utilities.log(error)

# If server side's coffee files change, compile these files,
# restart the server and then browser-reload.
# gulp.task 'server:restart', ['server:compile'], ->
# 	gulp.src('./server/**/*.js')
# 		.pipe(server())

# http://habrahabr.ru/company/trackduck/blog/230257/

# source maps не работают в angular js - это баг хрома, видимо
# http://stackoverflow.com/questions/19420604/angularjs-stack-trace-ignoring-source-map

# gulp				 = require('gulp')
# bower				= require('gulp-bower')
# less				 = require('gulp-less')
# concat			 = require('gulp-concat')
# nodemon			= require('gulp-nodemon')
# util				 = require('gulp-util')
# event_stream = require('event-stream')
# uglify			 = require('gulp-uglify')
# ngAnnotate	 = require('gulp-ng-annotate')
# sourcemaps	 = require('gulp-sourcemaps')
# livereload	 = require('gulp-livereload')
# replace			= require('gulp-replace-task')
# git					= require('gulp-git')
# plumber			= require('gulp-plumber')
# server			 = require('gulp-develop-server')

# the_package = require('./package.json')

# code_revision = null
# default_routing_configuration = null
# version_helper_class = null

# build = util.env.build

# live_reload = (content) ->
#	 if not build && not util.env.test
#		 return content.pipe(livereload())

# gulp.task 'bower', ->
#	 bower()
#		 .pipe(gulp.dest('public/lib/'))

# gulp.task 'code-revision', (callback) ->
#	 if code_revision
#		 return callback()
	
#	 git.revParse { args: '--short HEAD' }, (error, hash) ->
#		 git_hash = hash

#		 git.exec { args: 'show -s --format=%ci ' + hash }, (error, stdout) ->
#			 date = new Date(stdout.trim())
#			 code_revision = hash + ', ' + date

#			 # finished
#			 callback()

# # resources

# gulp.task 'html', ->
#	 live_reload(gulp.src(['./src/client/**/*.html'])
#		 .pipe(gulp.dest('./public')))

# gulp.task 'css-libraries', ->
#	 live_reload(gulp.src(['./src/client/lib/*.css'])
#		 .pipe(gulp.dest('./public/lib')))	

# gulp.task 'images', ->
#	 live_reload(gulp.src(['./src/client/i/**/*.*'])
#		 .pipe(gulp.dest('./public/i')))

# gulp.task 'fonts', ->
#	 live_reload(gulp.src(['./src/client/resources/fonts/*.*'])
#		 .pipe(gulp.dest('./public/resources/fonts')))

# gulp.task 'resources', ->
#	 # live_reload(gulp.src(['./src/client/lib/purecss.min.css'])
#	 #	 .pipe(gulp.dest('./public/lib')))

# gulp.task 'less', ->
#	 live_reload(
#		 gulp.src(['./src/client/**/*.less'])

#			 # Report errors but don't disconnect the stream
#			 .pipe(plumber((error) ->
#				 console.error('')
#				 console.error('=======================')
#				 console.error('LESS compilation error:')
#				 console.error('=======================')
#				 console.error('')
#				 console.error(error.message)
#				 console.error('')
#				 console.error(error.stack)
#			 ))

#			 .pipe(if build then util.noop() else sourcemaps.init())
#			 .pipe(less({ compress: build }).on('error', (error) -> @emit('end')))
#			 .pipe(concat('all.css'))
#			 .pipe(if build then util.noop() else sourcemaps.write())
#			 .pipe(gulp.dest('./public'))
#	 )

# gulp.task 'scripts', ['server:resources'], ->

#	 default_routing_configuration = default_routing_configuration || require('./server/filedb/system/routing.json')

#	 event_stream.merge(
#		 gulp.src(['./src/client/app.coffee', './src/client/**/*.coffee', '!./src/client/tests{,/**}'])
			
#			 # Report errors but don't disconnect the stream
#			 .pipe(plumber((error) ->
#				 console.error('')
#				 console.error('===============================')
#				 console.error('CoffeeScript compilation error:')
#				 console.error('===============================')
#				 console.error('')
#				 console.error(error.message)
#				 console.error('')
#				 console.error(error.stack)
#			 ))

#			 .pipe(replace({
#				 patterns: [{
#					 match: 'default_routing_configuration',
#					 replacement: default_routing_configuration
#				 }]
#			 }))
#			 .pipe(if build then util.noop() else sourcemaps.init())
#			 .pipe(coffee()),
#		 gulp.src('./src/client/**/*.js')
#			 .pipe(if build then util.noop() else sourcemaps.init())
#	 )
#	 .pipe(ngAnnotate())
#	 .pipe(if build then uglify() else util.noop())
#	 .pipe(concat('all.js'))
#	 .pipe(if build then util.noop() else sourcemaps.write())
#	 .pipe(gulp.dest('./public'))

# replacement = ->
#	 replace({
#		 patterns: [{
#			 match: 'version',
#			 replacement: the_package.version
#		 }, {
#			 match: 'code_revision',
#			 replacement: code_revision
#		 }]
#	 })

# gulp.task 'server:resources', ['code-revision'], ->
#	 live_reload(
#		 gulp.src(['./src/server/**/*.json', '!./src/server/filedb{,/**}'])
#			 .pipe(replacement())
#			 .pipe(gulp.dest('./server'))
#	 )

# # general

# gulp.task 'watch', ->
#	 gulp.watch(['src/client/**/*.js', 'src/client/**/*.coffee', '!./src/client/tests{,/**}'], ['scripts'])
#	 gulp.watch(['src/client/**/*.less'], ['less'])
#	 gulp.watch(['src/client/**/*.html'], ['html'])

# gulp.task 'server:watch', ['server:start'], ->
#	 gulp.watch(['src/server/**/*.js', 'src/server/**/*.coffee'], ['server:restart'])

#	 gulp.watch(['src/server/**/*.json'], ['server:restart'])
#	 gulp.watch(['src/config.json', 'src/config.default.json'], ['server:restart'])

# gulp.task 'install:watch', ['install:compile'], ->
#	 gulp.watch(['src/install/**/*.coffee'], ['install:compile'])

# server_options = 
#	 path		 : './server/server.js',
#	 execArgv : ['--harmony']

# gulp.task 'server:compile', ['server:resources'], ->
#	 event_stream.merge(
#		 gulp.src('./src/server/**/*.coffee')
#			 # Report errors but don't disconnect the stream
#			 .pipe(plumber((error) ->
#				 console.error('')
#				 console.error('===============================')
#				 console.error('CoffeeScript compilation error:')
#				 console.error('===============================')
#				 console.error('')
#				 console.error(error.message)
#				 console.error('')
#				 console.error(error.stack)
#			 ))

#			 .pipe(replacement())

#			 .pipe(if build then util.noop() else sourcemaps.init())
#			 .pipe(coffee()),

#		 gulp.src('./src/server/**/*.js')
#			 .pipe(replacement())
#			 .pipe(if build then util.noop() else sourcemaps.init())
#	 )
#	 .pipe(if build then util.noop() else sourcemaps.write())
#	 .pipe(gulp.dest('./server'))

# gulp.task 'install:compile', ->
#	 version_helper_class = require('fs').readFileSync('./src/client/services/version.coffee', 'utf8')

#	 gulp.src('./src/install/**/*.coffee')
#	 # Report errors but don't disconnect the stream
#	 .pipe(plumber((error) ->
#		 console.error('')
#		 console.error('===============================')
#		 console.error('CoffeeScript compilation error:')
#		 console.error('===============================')
#		 console.error('')
#		 console.error(error.message)
#		 console.error('')
#		 console.error(error.stack)
#	 ))

#	 .pipe(replace({
#		 patterns: [{
#			 match: 'version',
#			 replacement: the_package.version
#		 }, {
#			 match: 'version_helper_class',
#			 replacement: version_helper_class
#		 }]
#	 }))

#	 .pipe(if build then util.noop() else sourcemaps.init())
#	 .pipe(coffee())
#	 .pipe(if build then util.noop() else sourcemaps.write())
#	 .pipe(gulp.dest('./install'))

# gulp.task 'server:start', ['server:compile'], ->
#	 server.listen server_options, (error) ->
#		 if error
#			 util.log('Server startup error:')
#			 util.log(error)

# # If server side's coffee files change, compile these files,
# # restart the server and then browser-reload.
# gulp.task 'server:restart', ['server:compile'], ->
#	 gulp.src('./server/**/*.js')
#		 .pipe(server())

# gulp.task 'test', ['test:compile'], (done) ->
#	 karma = require('karma').server

#	 karma.start({
#		 configFile: __dirname + '/karma.conf.js',
#		 singleRun: yes
#	 }, 
#	 done)

# gulp.task 'test:compile', ['scripts'], ->

#	 gulp.src(['./src/client/tests{,/**}'])
	
#	 # Report errors but don't disconnect the stream
#	 .pipe(plumber((error) ->
#		 console.error('')
#		 console.error('===============================')
#		 console.error('CoffeeScript compilation error:')
#		 console.error('===============================')
#		 console.error('')
#		 console.error(error.message)
#		 console.error('')
#		 console.error(error.stack)
#	 ))

#	 .pipe(replace({
#		 patterns: [{
#			 match: 'default_routing_configuration',
#			 replacement: default_routing_configuration
#		 }]
#	 }))
#	 .pipe(sourcemaps.init())
#	 .pipe(coffee())
#	 .pipe(concat('tests.js'))
#	 .pipe(sourcemaps.write())
#	 .pipe(gulp.dest('./public'))

# gulp.task 'pack', ->
#	 # pack.sh

# # other

# gulp.task 'client', [
#	 'bower', 
#	 'html', 
#	 'css-libraries',
#	 'images', 
#	 'fonts', 
#	 'resources', 
#	 'less', 
#	 'scripts', 
#	 'watch'
# ]

# gulp.task 'default', [
#	 'server:watch',
#	 'client',
#	 'install:watch'
# ]

# gulp.task 'build', [
#	 'bower', 
#	 'html', 
#	 'css-libraries',
#	 'images', 
#	 'fonts', 
#	 'resources', 
#	 'less', 
#	 'server:compile', 
#	 'install:compile', 
#	 'scripts'
# ]
