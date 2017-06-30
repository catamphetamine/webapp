import path from 'path'
import fs   from 'fs-extra'

import _ from './language'
import configuration from './configuration'
import global_variables from './global variables'

Promise.promisifyAll(fs)

global.Root_folder = path.join(__dirname, '..')

const knexfile_path = path.join(global.Root_folder, 'backend/database/sql/knexfile.js')

if (fs.existsSync(knexfile_path))
{
	global.knexfile = require(knexfile_path)
}
else
{
	global.knexfile = false
}

global.configuration = configuration

for (let key of Object.keys(global_variables))
{
	global[key] = global_variables[key]
}

global.address_book = {}

for (let key of Object.keys(global.configuration))
{
	if (!key.ends_with('_server') && !key.ends_with('_service'))
	{
		continue
	}

	const value = global.configuration[key]

	if (is_object(value) && is_object(value.http) && value.http.port)
	{
		global.address_book[key] = `http://${value.http.host || 'localhost'}:${value.http.port}`
	}
}

// console.log('Address book', global.address_book)

global.catch_errors = function(returns_promise)
{
	returns_promise().catch((error) =>
	{
		log.error(error)
		process.exit(1)
	})
}