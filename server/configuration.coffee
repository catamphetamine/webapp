fs = require 'fs'
path = require 'path'
# strip_json_comments = require 'strip-json-comments'

require "#{__dirname}/../client/scripts/libraries/language"

configuration = require("#{__dirname}/../configuration.defaults")
Object.extend(configuration, require("#{__dirname}/../configuration"))
module.exports = configuration

# можно будет использовать этот файл в shell'овых скриптах
# (команда: node configuration.coffee --path="...")

process_arguments = require('minimist')(process.argv.slice(2))

if process_arguments.path
	return console.log(Object.path(configuration, process_arguments.path))