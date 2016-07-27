require('../../../code/server entry')

global.log = require('./log')

require('./database').connect().then(() => require('./main'))