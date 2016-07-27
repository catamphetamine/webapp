import log from './log'
import webpack_configuration from '../webpack/webpack.config'
import Webpack_isomorphic_tools from 'webpack-isomorphic-tools'
import webpack_isomorphic_tools_configuration from '../webpack/webpack-isomorphic-tools.js'

global._server_ = true
global._client_ = false

global._disable_server_side_rendering_ = false

global.log = log

global.webpack_isomorphic_tools = new Webpack_isomorphic_tools(webpack_isomorphic_tools_configuration)
.development(global._development_)
.server(webpack_configuration.context, function()
{
	require('./main')
})