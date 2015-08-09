import knex from 'knex'
import log from './log'

if (true) 
{
	log.info('skipping database connection')
}
else
{
	log.info(`Connecting to the "${configuration.web.database.database}" database`)
	log.info('(will fail with ECONNRESET if the database doesn\'t exist)')

	database_connection_options = 
	{
		client: 'pg',
		debug: false,
		connection:
		{
			host     : configuration.api_server.database.host,
			port     : configuration.api_server.database.port,
			user     : configuration.api_server.database.user,
			password : configuration.api_server.database.password,
			database : configuration.api_server.database.database,
			charset  : 'utf8'
		}
	}

	knex_instance = knex(database_connection_options)

	// это дальше делать, наверное, только после соединения с базой

	bookshelf = require('bookshelf')(knex_instance)

	// User = bookshelf.Model.extend({
	//   tableName: 'users'
	// })

	// ,
	//   pool: {
	//     min: 0,
	//     max: 7
	//   }

	// knex.destroy
}