require('babel-register')
require('babel-polyfill')

// use `bluebird` for Promises
require('./bluebird')

require('./server entry.es6')