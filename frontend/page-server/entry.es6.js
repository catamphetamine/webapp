import log from './log'
import webpack_configuration from '../webpack/webpack.config'
import Webpack_isomorphic_tools from 'webpack-isomorphic-tools'
import webpack_isomorphic_tools_configuration from '../webpack/webpack-isomorphic-tools.js'

global._server_ = true
global._client_ = false


// Is React Server Side Rendering disabled?
//
// (does not affect server side routing
//  and server side page preloading)
//
// Can be used to offload React server-side rendering
// from the server side to the client's web browser
// (as a performance optimization) by setting it to `true`.
//
global._disable_server_side_rendering_ = true

global.log = log

global.webpack_isomorphic_tools = new Webpack_isomorphic_tools(webpack_isomorphic_tools_configuration)
.server(webpack_configuration.context, function()
{
	require('./main')
})