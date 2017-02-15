import set_seconds from 'date-fns/set_seconds'
import { http, errors, jwt } from 'web-service'

import store      from '../store/store'
import Throttling from '../../common/throttling'
import get_word   from '../dictionaries/dictionary'

const throttling = new Throttling
({
	succeeded : store.succeeded.bind(store),
	failed    : store.failed.bind(store)
},
'Access code attempts limit exceeded')

export default function(api)
{
	// Issues a new access code
	api.post('/', async function({ locale, user })
	{
		const entry = await store.get_by_user_id(user)

		// Limit access code request frequency for a user
		if (entry)
		{
			await throttling.attempt(entry)
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

		return await throttling.attempt(entry, async () =>
		{
			if (entry.code !== code)
			{
				return
			}

			store.delete(id)
			return entry.user
		})
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