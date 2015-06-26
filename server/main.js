import look from 'look'
look.start()

import path from 'path'

const Root_folder = path.normalize(__dirname + '/..')
global.Root_folder = Root_folder

import utility from './libraries/utility'

import language from './../client/scripts/libraries/language'

// Configuration

import configuration from './configuration'
// global.configuration = configuration

console.log("Configuration:", configuration)

// Logging
// log4js = require 'log4js'
// log = log4js.getLogger()
// log.setLevel(if configuration.debug then 'DEBUG' else 'INFO')

import log from './log'
// global.log = log

// maybe not used
// import domains from 'domains'
// global.domains = domains

import bookshelf from './database'

import web from './web'