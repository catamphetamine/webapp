require('../../../code/server entry')

global.log = require('./log')

wait_for_stores([require('./store/store')], () => require('./web server'))