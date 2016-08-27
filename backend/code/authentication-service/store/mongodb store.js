import MongoDB from '../../common/mongodb'

import { lookup_ip, can_lookup_ip } from '../../../../code/geocoding'

import online_status_store from './online/online store'

// This store is probably out of sync because it's not used now
export default class Mongodb_store extends MongoDB
{
	async ready()
	{
		return this.connecting || (this.connecting = this.connect())
	}

	async create_user(user)
	{
		const result = await this.collection('user_authentication').insertAsync(user)
		return this.inserted_id(result).toString()
	}

	async find_user_by_id(id)
	{
		const result = await this.collection('user_authentication').get_by_id(id)
		return this.to_object(result)
	}

	async find_user_by_email(email)
	{
		const result = await this.collection('user_authentication').findOneAsync({ email })
		return this.to_object(result)
	}

	async find_token_by_id(token_id)
	{
		const token = await this.collection('authentication_tokens').get_by_id(token_id)

		return this.to_object(token)
	}

	async update_email(user_id, email)
	{
		await this.collection('user_authentication').update_by_id(user_id, { $set: { email } })
	}

	async update_password(user_id, password)
	{
		await this.collection('user_authentication').update_by_id(user_id, { $set: { password } })
	}

	async revoke_token(token_id)
	{
		// // remove the token from user data
		// await this.collection('user_authentication').update_by_id(user_id,
		// {
		// 	$pull:
		// 	{
		// 		authentication_tokens: this.ObjectId(token_id)
		// 	}
		// })
		//
		// // remove the token from the database
		// await this.collection('authentication_tokens').remove_by_id(token_id)

		await this.collection('authentication_tokens').update
		({
			_id     : this.ObjectId(token_id),
			revoked : { $exists: false }
		},
		{
			$set:
			{
				revoked: new Date()
			}
		})
	}

	async add_authentication_token(user, ip)
	{
		const now = new Date()

		// Add the token to the database
		const authentication_token_id = (await this.collection('authentication_tokens').insertAsync
		({
			user_id : this.ObjectId(user.id),
			created : now,

			// redundant field for faster access token sorting
			latest_access : now,

			history:
			[{
				ip,
				time: now
			}]
		}))
		.insertedIds[0]

		// If there's too much tokens, then remove excessive revoked ones
		await this.remove_excessive_tokens(user.id)

		// Add the token to user data
		await this.collection('user_authentication').update_by_id(user.id,
		{
			$set:
			{
				// redundant field for faster latest activity time querying
				latest_activity_time: now
			},

			$push:
			{
				authentication_tokens: this.ObjectId(authentication_token_id)
			}
		})

		return authentication_token_id.toString()
	}

	async remove_excessive_tokens(user_id)
	{
		// Allow max 10 tokens per user
		const user_token_limit = 10

		// Get a list of all authentication tokens for this user
		const tokens = await this.collection('authentication_tokens').query
		({
			user_id : this.ObjectId(user_id)
		},
		{
			sort:
			{
				latest_access: 1
			}
		})

		// Sort tokens in the following order:
		//
		// not revoked tokens used recently,
		// not revoked tokens used a long time ago,
		// tokens revoked recently,
		// tokens revoked a long time ago.
		//
		tokens.sort((a, b) =>
		{
			if (!a.revoked && !b.revoked)
			{
				return b.latest_access - a.latest_access
			}

			if (a.revoked && !b.revoked)
			{
				return 1
			}

			if (!a.revoked && b.revoked)
			{
				return -1
			}

			return b.revoked.getTime() - a.revoked.getTime()
		})

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
			await this.collection('authentication_tokens').remove_by_id(token._id)
		}
	}

	async record_access(user_id, authentication_token_id, ip, time)
	{
		// Update user's `latest_activity_time`
		await this.collection('user_authentication').update_by_id(user_id,
		{
			$set:
			{
				// redundant field for faster latest activity time querying
				latest_activity_time: time
			}
		})

		// Create access history entry for the token for this IP
		const access_entry = { ip, time }

		// If there's no access history entry for the token for this IP,
		// then insert it to the history.
		const history_entry_added = await this.collection('authentication_tokens').findAndModifyAsync
		(
			{
				_id          : this.ObjectId(authentication_token_id),
				'history.ip' : { $ne: ip }
			},
			undefined,
			{
				$push:
				{
					history: access_entry
				}
			}
		)

		// The update that will be performed on the token
		let update =
		{
			$set:
			{
				// Redundant field for faster access token sorting
				latest_access: time
			}
		}

		// If there previously was no access history entry for the token for this IP,
		// then also set the place on this history entry.
		if (history_entry_added.value !== null)
		{
			// Gather info about the place of access
			const place = await get_place_for_ip(ip)

			// Log the place info
			if (place && place.city)
			{
				update.$set['history.$.place'] = place
			}
		}
		// Else, if there already was an access history entry for the token for this IP,
		// then just update its `time`.
		else
		{
			update.$set['history.$.time'] = time
		}

		// Perform the update on the token
		await this.collection('authentication_tokens').updateOneAsync
		(
			{
				_id          : this.ObjectId(authentication_token_id),
				'history.ip' : ip
			},
			update
		)
	}

	async get_tokens(user_id)
	{
		return this.to_objects(await this.collection('authentication_tokens').query
		({
			user_id: this.ObjectId(user_id)
		},
		{
			sort: { latest_access: -1 }
		}))
	}

	async set_login_temperature(user_id, temperature)
	{
		await this.collection('user_authentication').update_by_id(user_id,
		{
			$set:
			{
				'latest_failed_authentication_attempt.temperature': temperature
			}
		})
	}

	async set_latest_failed_authentication_attempt(user_id, temperature)
	{
		await this.collection('user_authentication').update_by_id(user_id,
		{
			$set:
			{
				latest_failed_authentication_attempt:
				{
					when: new Date(),
					temperature
				}
			}
		})
	}

	async clear_latest_failed_authentication_attempt(user_id)
	{
		await this.collection('user_authentication').update_by_id(user_id,
		{
			$unset:
			{
				latest_failed_authentication_attempt: true
			}
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