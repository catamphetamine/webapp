import { lookup_ip, can_lookup_ip } from '../../../../code/geocoding'
import online_status_store from './online store'
import Sql from '../../common/sql'

class Sql_store
{
	ready()
	{
		return this.connecting || (this.connecting = this.connect())
	}

	async close()
	{
		await this.connecting
	}

	async connect()
	{
		this.users = new Sql('users')
		this.access_token_history = new Sql('access_token_history')
		this.access_tokens = new Sql('access_tokens',
		{
			history : Sql.many(this.access_token_history, 'token'),
			user    : Sql.one(this.users)
		})
	}

	get_all_valid_tokens(user_id)
	{
		return this.access_tokens.find_all
		({
			user       : user_id,
			revoked_at : null
		})
	}

	find_token_by_id(id)
	{
		return this.access_tokens.find(id)
	}

	revoke_token(token_id)
	{
		return this.access_tokens.update
		({
			id         : token_id,
			revoked_at : null
		},
		{
			revoked_at : new Date()
		})
	}

	async add_access_token(user_id, ip)
	{
		const now = new Date()

		const access_token_id = await this.access_tokens.create
		({
			created_at : now,
			user       : user_id
		})

		const history_entry =
		{
			ip,
			updated_at : now,
			token      : access_token_id
		}

		// Since there previously was no access history entry for the token for this IP,
		// then also set the place on this history entry.

		// Gather info about the place of access
		const place = await get_place_for_ip(ip)

		// Log the place info
		if (place && place.city)
		{
			history_entry.place = place
		}

		await this.access_token_history.create(history_entry)

		return access_token_id
	}

	async remove_excessive_tokens(user_id)
	{
		// Allow max 10 tokens per user
		const user_token_limit = 10

		// Get a list of all authentication tokens for this user
		const tokens = await this.access_tokens.find_all({ user: user_id }, { including: ['history'] })

		// First the most active ones,
		// then the most obsolete ones.
		sort_tokens_by_relevance(tokens)

		// If the token limit hasn't been exceeded, then remove no tokens
		if (tokens.length <= user_token_limit)
		{
			return
		}

		// The token limit has been exceeded, so remove excessive tokens
		// (the ones in the end are less relevant, the first ones are most relevant)
		const excessive_tokens = tokens.slice(user_token_limit)

		// Remove excessive tokens one-by-one
		for (let token of excessive_tokens)
		{
			await this.remove_token(token.id, user_id)

			if (!token.revoked_at)
			{
				await online_status_store.clear_access_token_validity(user_id, token.id)
			}
		}
	}

	async remove_token(token_id, user_id)
	{
		await this.access_tokens.delete(token_id, user_id)
	}

	async record_access(user_id, access_token_id, ip, time)
	{
		// `knex` doesn't support PostgreSQL upsert
		// https://github.com/tgriesser/knex/issues/54#issuecomment-242074190
		// await this.knex.raw(`INSERT INTO ${access_token_history_table_name} (id, ...) VALUES (?, ...) ON CONFLICT (id) DO UPDATE SET id = EXCLUDED.id RETURNING id`, [id])

		// Try to update access token history entry for this IP address
		// with the new access time.
		if (!await this.access_token_history.update
		({
			token: access_token_id,
			ip
		},
		{
			updated_at: time
		}))
		{
			try
			{
				// Create access token history entry for this IP address
				const history_entry_id = await this.access_token_history.create
				({
					token: access_token_id,
					ip,
					updated_at: time
				})

				// Since there previously was no access history entry for the token for this IP,
				// then also set the place on this history entry.

				// Gather info about the place of access
				const place = await get_place_for_ip(ip)

				// Log the place info
				if (place && place.city)
				{
					await this.access_token_history.update(history_entry_id, { place })
				}
			}
			catch (error)
			{
				// If there was a concurrent insertion for the same (token, ip) pair,
				// then it's ok, because the inserted access time is in fact the same.
				//
				// "duplicate key value violates unique constraint
				//  "access_token_history_token_ip_unique""
				if (error.message.has('access_token_history_token_ip_unique'))
				{
					// ok
				}
				else
				{
					throw error
				}
			}
		}
	}

	async get_tokens(user_id)
	{
		const tokens = await this.access_tokens.find_all
		({
			user: user_id
		},
		{
			including: ['history']
		})

		// First the most active ones,
		// then the most obsolete ones.
		sort_tokens_by_relevance(tokens)

		return tokens
	}
}

export default new Sql_store()

async function get_place_for_ip(ip)
{
	if (!can_lookup_ip())
	{
		return
	}

	try
	{
		return await lookup_ip(ip)
	}
	catch (error)
	{
		log.error(error)
	}
}

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