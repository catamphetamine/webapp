import log from './log'
import store from './store/store'
import web_server from './web server'

global.log = log
wait_for_stores([store], web_server)