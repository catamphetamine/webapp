require('../../../code/server entry')

global.log = require('./log')

wait_for_stores
([
	require('./store/online/online store'),
	require('./store/store').default
],
() => require('./web server'))