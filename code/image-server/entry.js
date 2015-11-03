require('../server entry')

require('bluebird').promisifyAll(require('fs-extra'))

global.log = require('./log')

require('./main')