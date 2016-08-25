// https://github.com/59naga/babel-plugin-transform-bluebird/pull/2
import Promise from 'bluebird'

import path from 'path'
import fs   from 'fs-extra'

import _ from './language'
import configuration from './configuration'
import global_variables from './global variables'

global._development_ = process.env.NODE_ENV !== 'production'
global._production_ = !global._development_

Promise.promisifyAll(fs)

global.Root_folder = path.join(__dirname, '..')

if (fs.existsSync(path.join(Root_folder, 'backend/knexfile.js')))
{
	global.knexfile = require(path.join(Root_folder, 'backend/knexfile.js'))
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

	if (is_object(value) && is_object(value.http) && value.http.host && value.http.port)
	{
		global.address_book[key] = `http://${value.http.host}:${value.http.port}`
	}
}

// console.log('Address book', global.address_book)

global.wait_for_stores = function(stores, then)
{
	return Promise.all(stores.map(store => store.ready()))
		.then(then)
		.catch((error) =>
		{
			log.error(error)
			process.exit(1)
		})
}