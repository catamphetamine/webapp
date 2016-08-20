import path from 'path'
import fs   from 'fs'

import Memory_store from './memory store'
import Sql_store from './sql store'

function create_store()
{
	if (!fs.existsSync(path.join(Root_folder, 'knexfile.js'))) 
	{
		log.info('PostgreSQL connection is not configured. Using in-memory store.')
		return new Memory_store()
	}

	log.info(`Connecting to PostgreSQL`)
	log.info('(in case of failure with throw ECONNRESET)')

	return new Sql_store()
}

export default create_store()