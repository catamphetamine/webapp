import { http, errors } from 'web-service'

import store from '../store'

export default function(api)
{
	api.get('/', async ({}, { user }) =>
	{
		if (!user)
		{
			throw new errors.Unauthenticated()
		}

		return []
	})
}
