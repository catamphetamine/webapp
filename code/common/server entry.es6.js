import minimist from 'minimist'
import path     from 'path'
import fs       from 'fs-extra'

import _ from './language'

import configuration from './configuration'
import global_variables from './global variables'

const command_line_arguments = minimist(process.argv.slice(2))

global._development_ = false
if (process.env.NODE_ENV === 'development' || command_line_arguments.development)
{
	global._development_ = true
}
global._production_ = !global._development_

if (global._development_)
{
	Promise.longStackTraces()
}

Promise.promisifyAll(fs)

global.Root_folder = path.join(__dirname, '..', '..')

global.configuration = configuration

for (var key of Object.keys(global_variables))
{
	global[key] = global_variables[key]
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