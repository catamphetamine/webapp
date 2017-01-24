// `navigator` is required by `robust-websocket`
// https://github.com/appuri/robust-websocket/issues/9
global.navigator = {}

require('../../code/server entry')
require('./entry.es6')