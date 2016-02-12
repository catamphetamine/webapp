var babel_relay_plugin = require('babel-relay-plugin')

var path = require('path')

const Root_folder = path.resolve(__dirname, '..', '..')

var schema = require(path.resolve(Root_folder, 'build', 'relay schema.json'))

module.exports = babel_relay_plugin(schema.data)