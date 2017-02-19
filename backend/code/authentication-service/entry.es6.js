import online_store from './store/online/online store'
import store from './store/store'
import authentication_store from './store/authentication/store'
import web_server from './web server'

wait_for_stores
([
	online_store,
	store,
	authentication_store
],
web_server)