require('../../../code/server entry')

global.log = require('./log')

wait_for_stores([require('./database/database')], () => require('./web server'))