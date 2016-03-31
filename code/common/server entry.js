// use bluebird for Promises
require('babel-runtime/core-js/promise').default = require('bluebird')

var minimist = require('minimist')
var path = require('path')

global.Root_folder = path.resolve(__dirname, '..', '..')

var command_line_arguments = minimist(process.argv.slice(2))

global._production_ = command_line_arguments.production
global._development_ = command_line_arguments.development || process.env.NODE_ENV === 'development'

if (global._development_)
{
	require('bluebird').longStackTraces()
}

require('babel-register')

require('./language')

require('bluebird').promisifyAll(require('fs-extra'))

global.configuration = require('./configuration')

var environment_variables = require('./environment variables')

for (var key of Object.keys(environment_variables))
{
	global[key] = environment_variables[key]
}

global.address_book = {}

for (var key of Object.keys(global.configuration))
{
	if (!key.ends_with('_server') && !key.ends_with('_service'))
	{
		continue
	}

	var value = global.configuration[key]

	if (is_object(value) && is_object(value.http) && value.http.host && value.http.port)
	{
		global.address_book[key] = `http://${value.http.host}:${value.http.port}`
	}
}

// console.log('Address book', global.address_book)