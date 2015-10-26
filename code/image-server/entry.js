require('../server entry')

require('bluebird').promisifyAll(require('fs-extra'))

require('./main')