// use bluebird for Promises
require('babel-runtime/core-js/promise').default = require('bluebird')

require('babel-register')

require('./server entry.es6')