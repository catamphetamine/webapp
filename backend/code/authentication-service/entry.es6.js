import log from './log'

import online_store from './store/online/online store'
import store from './store/store'
import web_server from './web server'

global.log = log

wait_for_stores
([
	online_store,
	store
],
web_server)