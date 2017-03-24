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
		this.posters = new Sql('posters')
		this.posters.model.blocked_by = Sql.one(this.posters)

		this.alias_history = new Sql('poster_alias_history')
		this.block_poster_tokens = new Sql('block_poster_tokens')
	}

	create_poster(poster)
	{
		return this.posters.create(poster)
	}

	// Gets user's poster
	get_user_poster(user_id)
	{
		return this.posters.find({ user: user_id })
	}

	// Finds poster by `id` or `alias`
	find_poster(id, options)
	{
		// If `id` is numerical, then find poster by `id`
		if (String(parseInt(id)) === String(id))
		{
			return this.get_poster(id, options)
		}

		// Otherwise, find poster by `alias`
		return this.find_poster_by_alias(id, options)
	}

	get_poster(id, options)
	{
		return this.posters.find(id, options)
	}

	async find_poster_by_alias(alias, options)
	{
		// Search for a poster with this alias
		const poster = await this.posters.find({ alias }, options)

		if (poster)
		{
			return poster
		}

		// Check poster alias history
		const alias_history_entry = await this.alias_history.find({ alias })

		// If this alias has been previously taken by another poster,
		// then this alias is reserved (forever).
		if (alias_history_entry)
		{
			return await this.get_poster(alias_history_entry.poster, options)
		}
	}

	update_poster(id, data)
	{
		return this.posters.update(id, data)
	}

	update_picture(id, picture)
	{
		// Store the picture `id` and also picture `sizes`
		// (to avoid joining the giant `images` table)
		return this.update_poster(id,
		{
			picture
		})
	}

	async can_take_alias(alias, poster_id)
	{
		// Get current poster alias
		const poster = await this.posters.find({ alias })

		// If there is a poster with this alias
		// and this poster isn't self,
		// then this alias is already taken.
		if (poster)
		{
			if (!poster_id || poster.id !== poster_id)
			{
				return false
			}
		}

		// Check poster alias history
		const alias_history_entry = await this.alias_history.find({ alias })

		// If this alias has been previously taken by another poster,
		// then this alias is reserved (forever).
		if (alias_history_entry && alias_history_entry.poster !== poster_id)
		{
			return false
		}

		// The alias is free
		return true
	}

	async change_alias(poster_id, alias)
	{
		// Get current alias
		const poster = await this.get_poster(poster_id)

		// Check for max aliases in history threshold reached
		const previous_aliases_count = await this.alias_history.count({ poster: poster_id })

		if (previous_aliases_count > Max_aliases_in_history)
		{
			throw new Error(`Max aliases reached`)
		}

		// If there's current alias, move it to alias history
		if (poster.alias)
		{
			await this.alias_history.create({ poster: poster_id, alias: poster.alias })
		}

		// Update poster alias
		await this.update_poster(poster_id, { alias })

		// If this alias has been previously taken by this poster,
		// then remove it from history.

		const alias_history_entry = await this.alias_history.find({ poster: poster_id, alias })

		if (alias_history_entry)
		{
			await this.alias_history.delete(alias_history_entry.id)
		}
	}

	validate_alias(alias)
	{
		return String(parseInt(alias)) !== String(alias)
	}

	async generate_block_poster_token(poster_id, options = {}, tries_made = 0)
	{
		try
		{
			const token_id = uuid.v4()
			const token = { id: token_id, poster: poster_id }

			if (options.self)
			{
				token.self = true
			}

			await this.block_poster_tokens.create(token)
			return token_id
		}
		catch (error)
		{
			// If there already is a token with this id
			// (which is extremely unlikely for a v4 UUID),
			// then try to generate a UUID once again.
			//
			// "duplicate key value violates unique constraint
			//  "block_poster_tokens_uuid""
			if (error.message.has('block_poster_tokens_uuid'))
			{
				if (tries_made === 10)
				{
					throw error
				}

				return await this.generate_block_poster_token(poster_id, options, tries_made++)
			}
			else
			{
				throw error
			}
		}
	}

	get_block_poster_token(id)
	{
		return this.block_poster_tokens.find(id)
	}

	delete_block_poster_token(id)
	{
		return this.block_poster_tokens.delete(id)
	}
}

export default new Sql_store()