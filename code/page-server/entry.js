require('../common/server entry')

global._server_ = true
global._client_ = false

global._disable_server_side_rendering_ = false

global.log = require('./log')

var webpack_configuration = require('../../webpack/webpack.config')
var Webpack_isomorphic_tools = require('webpack-isomorphic-tools')

global.webpack_isomorphic_tools = new Webpack_isomorphic_tools(require('../../webpack/webpack-isomorphic-tools.js'))
.development(global._development_)
.server(webpack_configuration.context, function()
{
	require('./main')
})