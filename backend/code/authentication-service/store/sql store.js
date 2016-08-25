import { lookup_ip, can_lookup_ip } from '../../../../code/geocoding'

import online_status_store from './online/online store'
import Sql from '../../common/sql'

const authentication_token_access_history_table_name = 'authentication_token_access_history'

export default class Sql_store
{
	ready()
	{
		return this.connecting || (this.connecting = this.connect())
	}

	async connect()
	{
		const models = this

		const bookshelf = Sql.bookshelf()

		this.knex = bookshelf.knex

		this.User = bookshelf.Model.extend
		({
			tableName : 'users',

			authentication_tokens()
			{
				return this.hasMany(models.Authentication_token, 'user')
			}
		})

		this.Authentication_token = bookshelf.Model.extend
		({
			tableName : 'authentication_tokens',

			user()
			{
				return this.belongsTo(models.User, 'user')
			},

			history()
			{
				return this.hasMany(models.Authentication_token_access_history, 'token')
			}
		},
		{
			// Used for cascade drop
			dependents: ['history']
		})

		this.Authentication_token_access_history = bookshelf.Model.extend
		({
			tableName : authentication_token_access_history_table_name,

			token()
			{
				return this.belongsTo(models.Authentication_token, 'token')
			}
		})

		this.users = new Sql(this.User)
		this.authentication_tokens = new Sql(this.Authentication_token)
		this.authentication_token_access_history = new Sql(this.Authentication_token_access_history)
	}

	create_user(user)
	{
		return this.users.create(user)
	}

	find_user_by_email(email)
	{
		return this.users.find({ email })
	}

	find_user_by_id(id)
	{
		return this.users.find(id)
	}

	find_token_by_id(id)
	{
		return this.authentication_tokens.find(id)
	}

	update_email(user_id, email)
	{
		return this.users.update(user_id, { email })
	}

	update_password(user_id, password)
	{
		return this.users.update(user_id, { password })
	}

	revoke_token(token_id)
	{
		return this.authentication_tokens.update
		({
			id         : token_id,
			revoked_at : null
		},
		{
			revoked_at : new Date()
		})
	}

	async add_authentication_token(user, ip)
	{
		const now = new Date()

		const authentication_token = await this.authentication_tokens.create
		({
			created_at : now,
			user       : user.id
		})

		const history_entry =
		{
			ip,
			updated_at : now,
			token      : authentication_token.id
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

		const access_history_entry = await this.authentication_token_access_history.create(history_entry)

		// If there's too much tokens, then remove excessive revoked ones
		await this.remove_excessive_tokens(user.id)

		return authentication_token.id
	}

	async remove_excessive_tokens(user_id)
	{
		// Allow max 10 tokens per user
		const user_token_limit = 10

		// Get a list of all authentication tokens for this user
		let tokens = await new this.User({ id: user_id })
			.authentication_tokens()
			.fetch({ withRelated: ['history'] })

		tokens = Sql.json(tokens)

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
			await this.authentication_tokens.remove(token.id)
			
			if (!token.revoked_at)
			{
				await online_status_store.clear_access_token_validity(user_id, token.id)
			}
		}
	}

	async record_access(user_id, authentication_token_id, ip, time)
	{
		// `knex` doesn't support PostgreSQL upsert
		// https://github.com/tgriesser/knex/issues/54#issuecomment-242074190
		// await this.knex.raw(`INSERT INTO ${authentication_token_access_history_table_name} (id, ...) VALUES (?, ...) ON CONFLICT (id) DO UPDATE SET id = EXCLUDED.id RETURNING id`, [id])

		// Try to update access token history entry for this IP address
		// with the new access time.
		try
		{
			await this.authentication_token_access_history.update
			({
				token: authentication_token_id,
				ip
			},
			{
				updated_at: time
			})
		}
		catch (error)
		{
			// If there was no access token history entry for this IP address,
			// then create it
			if (error instanceof this.Authentication_token_access_history.NoRowsUpdatedError)
			{
				try
				{
					// Create access token history entry for this IP address
					const history_entry = await this.authentication_token_access_history.create
					({
						token: authentication_token_id,
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
						await history_entry.save({ place })
					}
				}
				catch (error)
				{
					// If there was a concurrent insertion for the same (token, ip) pair,
					// then it's ok, because the inserted access time is in fact the same.
					//
					// "duplicate key value violates unique constraint
					//  "authentication_token_access_history_token_ip_unique""
					if (error.message.has('authentication_token_access_history_token_ip_unique'))
					{
						// ok
					}
					else
					{
						throw error
					}
				}
			}
			else
			{
				throw error
			}
		}

		// Update user's `was_online_at`
		await this.users.update(user_id, { was_online_at: time })
	}

	async get_tokens(user_id)
	{
		const tokens = Sql.json(await new this.User({ id: user_id })
			.authentication_tokens()
			.fetch({ withRelated: 'history' }))

		sort_tokens_by_relevance(tokens)

		return tokens
	}

	// Is called on cooldown (with time),
	// when a login attempt is requested.
	async set_login_temperature(user_id, temperature)
	{
		return this.users.update(user_id,
		{
			login_attempt_temperature : temperature
		})
	}

	// Is called on a failed login attempt
	set_latest_failed_login_attempt(user_id, temperature)
	{
		return this.users.update(user_id,
		{
			login_attempt_failed_at   : new Date(),
			login_attempt_temperature : temperature
		})
	}

	// Is called on a successfull login
	clear_latest_failed_login_attempt(user_id)
	{
		return this.users.update(user_id,
		{
			login_attempt_failed_at   : null,
			login_attempt_temperature : null
		})
	}
}

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
function sort_tokens_by_relevance(tokens)
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