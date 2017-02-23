import set_seconds from 'date-fns/set_seconds'
import { http, errors, jwt } from 'web-service'

import store      from '../store/store'
import Throttling from '../../common/throttling'
import get_word   from '../dictionaries/dictionary'

const throttling = new Throttling(store)

export default function(api)
{
	// Issues a new access code
	api.post('/', async function({ locale, user })
	{
		const entry = await store.get_by_user_id(user)

		// Limit access code request frequency for a user
		if (entry)
		{
			// Check that there's room for 2 attempts,
			// one of which is immediately "failed"
			// to throttle sending access codes.
			const { throttled, cooldown } = await throttling.attempt(entry, undefined, { count: 2 })

			if (throttled)
			{
				throw new errors.Access_denied('Access code attempts limit exceeded', { cooldown })
			}
		}

		let id
		const code = get_word(locale)

		if (entry)
		{
			await store.update_code(entry.id, code)
			id = entry.id
		}
		else
		{
			id = await store.create(code, user)
		}

		return { id, code }
	})

	// Verifies an access code
	api.get('/verify', async function({ id, code })
	{
		const entry = await store.get(id)

		if (!entry)
		{
			throw new errors.Not_found()
		}

		const { throttled, cooldown, result } = await throttling.attempt(entry, async () =>
		{
			// If the code doesn't match
			if (entry.code !== code)
			{
				// Maximum tries count reached
				if (entry.attempts_left === 0)
				{
					await store.lock(entry)
				}

				return
			}

			// The code matches. Reset cooldown.
			store.delete(id)
			return entry.user
		})

		if (throttled)
		{
			throw new errors.Access_denied('Access code attempts limit exceeded', { cooldown })
		}

		return result
	})

	// Gets user id by access code id
	api.get('/:id', async function({ id })
	{
		const access_code = await store.get(id)

		if (!access_code)
		{
			throw new errors.Not_found()
		}

		return access_code
	})
}