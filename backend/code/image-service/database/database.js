import Memory_database from './memory database'
import Sql_database    from './sql database'

function create_database()
{
	if (!knexfile) 
	{
		log.info('PostgreSQL connection is not configured. Using in-memory store.')
		return new Memory_database()
	}

	return new Sql_database()
}

export default create_database()