import uuid from 'uuid'

import Sql from '../common/sql'

const Max_aliases_in_history = 10

class Sql_store
{
	ready()
	{
		return this.connecting || (this.connecting = this.connect())
	}

	async connect()
	{
		this.users = new Sql('users')
		this.user_alias_history = new Sql('user_alias_history')
		this.block_user_tokens = new Sql('block_user_tokens')
	}

	create_user(user)
	{
		return this.users.create(user)
	}

	get_user_count()
	{
		return this.users.count()
	}

	// Finds user by `id` or `alias`
	find_user(id)
	{
		// If `id` is numerical, then find user by id
		if (String(parseInt(id)) === String(id))
		{
			return this.find_user_by_id(id)
		}

		// Otherwise, find user by `alias`
		return this.find_user_by_alias(id)
	}

	find_user_by_id(id)
	{
		return this.users.find(id)
	}

	find_user_by_email(email)
	{
		return this.users.find({ email })
	}

	async find_user_by_alias(alias)
	{
		// Search for a user with this alias
		const user = await this.users.find({ alias })

		if (user)
		{
			return user
		}

		// Check user alias history
		const alias_history_entry = await this.user_alias_history.find({ alias })

		// If this alias has been previously taken by another user,
		// then this alias is reserved (forever).
		if (alias_history_entry)
		{
			return await this.find_user_by_id(alias_history_entry.user)
		}
	}

	update_user(id, data)
	{
		return this.users.update(id, data)
	}

	update_picture(id, picture)
	{
		// Store the picture `id` and also picture `sizes`
		// (to avoid joining the giant `images` table)
		return this.update_user(id,
		{
			picture : picture.id,

			// `file_size`s aren't needed, so remove them too to free a bit of space
			picture_sizes : JSON.stringify(picture.sizes.map((size) =>
			({
				name   : size.name,
				width  : size.width,
				height : size.height
			})))
		})
	}

	update_locale(user_id, locale)
	{
		return this.users.update(user_id, { locale })
	}

	async can_take_alias(alias, self_id)
	{
		// Get current user alias
		const user = await this.users.find({ alias })

		// If there is a user with this alias
		// and this user isn't self,
		// then this alias is already taken.
		if (user)
		{
			if (!self_id || user.id !== self_id)
			{
				return false
			}
		}

		// Check user alias history
		const alias_history_entry = await this.user_alias_history.find({ alias })

		// If this alias has been previously taken by another user,
		// then this alias is reserved (forever).
		if (alias_history_entry && alias_history_entry.user !== self_id)
		{
			return false
		}

		// The alias is free
		return true
	}

	async change_alias(user_id, alias)
	{
		// Get current alias
		const user = await this.find_user_by_id(user_id)

		// Check for max aliases in history threshold reached
		const previous_aliases_count = await this.user_alias_history.count({ user: user_id })

		if (previous_aliases_count > Max_aliases_in_history)
		{
			throw new Error(`Max aliases reached`)
		}

		// If there's current alias, move it to alias history
		if (user.alias)
		{
			await this.user_alias_history.create({ user: user_id, alias: user.alias })
		}

		// Update user alias
		await this.update_user(user_id, { alias })

		// If this alias has been previously taken by this user,
		// then remove it from history.

		const alias_history_entry = await this.user_alias_history.find({ user: user_id, alias })

		if (alias_history_entry)
		{
			await this.user_alias_history.delete(alias_history_entry.id)
		}
	}

	validate_alias(alias)
	{
		return String(parseInt(alias)) !== String(alias)
	}

	async generate_block_user_token(user_id, options = {}, tries_made = 0)
	{
		try
		{
			const token_id = uuid.v4()
			const token = { id: token_id, user: user_id }

			if (options.self)
			{
				token.self = true
			}

			await this.block_user_tokens.create(token)
			return token_id
		}
		catch (error)
		{
			// If there already is a token with this id
			// (which is extremely unlikely for a v4 UUID),
			// then try to generate a UUID once again.
			//
			// "duplicate key value violates unique constraint
			//  "block_user_tokens_uuid""
			if (error.message.has('block_user_tokens_uuid'))
			{
				if (tries_made === 10)
				{
					throw error
				}

				return await this.generate_block_user_token(user_id, options, tries_made++)
			}
			else
			{
				throw error
			}
		}
	}

	get_block_user_token(id)
	{
		return this.block_user_tokens.find(id)
	}

	remove_block_user_token(id)
	{
		return this.block_user_tokens.delete(id)
	}
}

export default new Sql_store()