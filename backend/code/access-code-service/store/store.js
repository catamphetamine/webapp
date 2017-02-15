import Memory_store  from './memory store'
import Sql_store     from './sql store'

function create_store()
{
	if (!knexfile)
	{
		log.info('PostgreSQL connection is not configured. Using in-memory store.')
		return new Memory_store()
	}

	return new Sql_store()
}

export default create_store()