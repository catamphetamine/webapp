// use bluebird for Promises
require('babel-runtime/core-js/promise').default = require('bluebird')

require('babel/register')

var path = require('path')

global.Root_folder = path.resolve(__dirname, '..', '..')

global._client_ = false
global._server_ = true
global._disable_server_side_rendering_ = false

var minimist = require('minimist')
var command_line_arguments = minimist(process.argv.slice(2))

global._production_ = command_line_arguments.production
global._development_ = command_line_arguments.development || process.env.NODE_ENV === 'development'

var webpack_configuration = require('../../webpack/webpack.config')
var Webpack_isomorphic_tools = require('webpack-isomorphic-tools')

global.webpack_isomorphic_tools = new Webpack_isomorphic_tools(require('../../webpack/isomorphic.js'))
.development(global._development_)
.server(webpack_configuration.context, function()
{
	require('./main')
})