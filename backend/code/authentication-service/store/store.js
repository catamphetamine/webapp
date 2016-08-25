// import Mongodb_store from './mongodb store'
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

// Get authentication token's latest access date
function get_latest_access_date(token)
{
	return token.history.reduce((most_recently_used, history_entry) =>
	{
		if (most_recently_used.getTime() > history_entry.updated_at.getTime())
		{
			return most_recently_used
		}

		return history_entry.updated_at
	},
	new Date(0))
}

// Sort tokens in the following order:
//
// not revoked tokens used recently,
// not revoked tokens used a long time ago,
// tokens revoked recently,
// tokens revoked a long time ago.
//
export function sort_tokens_by_relevance(tokens)
{
	tokens.sort((a, b) =>
	{
		if (!a.revoked_at && !b.revoked_at)
		{
			return get_latest_access_date(b).getTime() - get_latest_access_date(a).getTime()
		}

		if (a.revoked_at && !b.revoked_at)
		{
			return 1
		}

		if (!a.revoked_at && b.revoked_at)
		{
			return -1
		}

		return b.revoked_at.getTime() - a.revoked_at.getTime()
	})
}