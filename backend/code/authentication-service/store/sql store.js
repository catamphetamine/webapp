import { lookup_ip, can_lookup_ip } from '../../../../code/geocoding'

import { sort_tokens_by_relevance } from './store'
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

		this.Authentication_data = bookshelf.Model.extend
		({
			tableName : 'authentication_data',

			user()
			{
				return this.belongsTo(models.User, 'user')
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
		this.authentication_data = new Sql(this.Authentication_data)
		this.authentication_tokens = new Sql(this.Authentication_token)
		this.authentication_token_access_history = new Sql(this.Authentication_token_access_history)
	}

	create_authentication_data(user_id, data)
	{
		return this.authentication_data.create({ ...data, user: user_id })
	}

	get_authentication_data(user_id)
	{
		return this.authentication_data.find({ user: user_id })
	}

	update_password(user_id, password)
	{
		return this.authentication_data.update({ user: user_id }, { password })
	}

	find_token_by_id(id)
	{
		return this.authentication_tokens.find(id)
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

	async add_authentication_token(user_id, ip)
	{
		const now = new Date()

		const authentication_token = await this.authentication_tokens.create
		({
			created_at : now,
			user       : user_id
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
		await this.remove_excessive_tokens(user_id)

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
	async set_login_temperature(authentication_data_id, temperature)
	{
		return this.authentication_data.update(authentication_data_id,
		{
			authentication_attempt_temperature : temperature
		})
	}

	// Is called on a failed login attempt
	set_latest_failed_authentication_attempt(authentication_data_id, temperature)
	{
		return this.authentication_data.update(authentication_data_id,
		{
			authentication_attempt_failed_at   : new Date(),
			authentication_attempt_temperature : temperature
		})
	}

	// Is called on a successfull login
	clear_latest_failed_authentication_attempt(authentication_data_id)
	{
		return this.authentication_data.update(authentication_data_id,
		{
			authentication_attempt_failed_at   : null,
			authentication_attempt_temperature : null
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