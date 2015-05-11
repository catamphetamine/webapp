return

log.info "Connecting to the \"#{configuration.web.database.database}\" database"
log.info "(will fail with ECONNRESET if the database doesn't exist)"

database_connection_options = 
	client: 'pg'
	debug: no
	connection:
		host     : configuration.web.database.host
		port     : configuration.web.database.port
		user     : configuration.web.database.user
		password : configuration.web.database.password
		database : configuration.web.database.database
		charset  : 'utf8'


knex = require('knex')(database_connection_options)

# это дальше делать, наверное, только после соединения с базой

bookshelf = require('bookshelf')(knex)

# User = bookshelf.Model.extend({
#   tableName: 'users'
# })

# ,
#   pool: {
#     min: 0,
#     max: 7
#   }

# knex.destroy