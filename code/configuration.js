import fs from 'fs'
import path from 'path'
import minimist from 'minimist'

// import strip_json_comments from 'strip-json-comments'

import _ from './language'

import configuration from '../configuration.defaults'

// allows overriding the default configuration 
// using `[project_folder]/configuration.js` file
// (if the file exists)
const specific_configuration_path = path.resolve(__dirname, '../configuration.js')
if (fs.existsSync(specific_configuration_path))
{
	const specific_configuration = require(specific_configuration_path)
	Object.extend(configuration, specific_configuration)
}

export default configuration

// можно будет использовать этот файл в shell'овых скриптах
// (команда: node configuration.coffee --path="...")

const process_arguments = minimist(process.argv.slice(2))

if (process_arguments.path)
{
	console.log(Object.path(configuration, process_arguments.path))
	process.exit()
}
