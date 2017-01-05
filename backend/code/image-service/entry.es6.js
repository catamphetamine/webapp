import log from './log'
import database from './database/database'
import web_server from './web server'

global.log = log
wait_for_stores([database], web_server)