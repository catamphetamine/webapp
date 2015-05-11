Root_folder = require('path').normalize(__dirname + '/..')
global.Root_folder = Root_folder

require "#{__dirname}/libraries/utility"

fs = require 'fs'

include '../client/scripts/libraries/language'
json_rpc = include 'json rpc'

# Configuration

configuration = include 'configuration'
global.configuration = configuration

console.log("Configuration:", configuration)

# Logging
# log4js = require 'log4js'
# log = log4js.getLogger()
# log.setLevel(if configuration.debug then 'DEBUG' else 'INFO')

log = include 'log'
global.log = log

global.domains = require 'domain'

bookshelf = include 'database'

include 'web'