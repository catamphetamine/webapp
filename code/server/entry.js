// require('babel/register')
// ({
// 	stage: 0,
// 	plugins: ['typecheck']
// })

var minimist = require('minimist')
// var piping = require('piping')
var path = require('path')

const Root_folder = path.resolve(__dirname, '..', '..')
global.Root_folder = Root_folder

global._client_ = false
global._server_ = true
global._disable_server_side_rendering_ = false  // <----- DISABLES SERVER SIDE RENDERING FOR ERROR DEBUGGING

var command_line_arguments = minimist(process.argv.slice(2))

global._production_ = command_line_arguments.production
global._development_ = command_line_arguments.development

// if (global._development_)
// {
// 	if (!piping
// 	({
// 		hook: true,
// 		ignore: /(\/\.|~$|\.json|\.scss$)/i
// 	}))
// 	{
// 		return
// 	}
// }

// alternatively, if you you can skip using this and insted use this: 
// (and webpack DefinePlugin for setting _client_ environment variable)
// const picture = _client_ ? require('./image.png') : webpack_isomorphic_tools.require('./image.png')
var webpack_configuration = require('../../webpack/webpack.config.js')
var Webpack_isomorphic_tools = require('webpack-isomorphic-tools')
global.webpack_isomorphic_tools = new Webpack_isomorphic_tools(webpack_configuration, require('../../webpack/isomorphic.js')).register().wait(function()
{
	require(path.resolve(__dirname, 'main'))
})