import { http } from 'web-service'

import store from '../store/store'

import Url from '../../../../code/url'

import { sign_in, register } from './user.base'

export default function(api)
{
	api.legacy.post('/legacy/sign-in', async function({ request })
	{
		const user = await sign_in.apply(this, arguments)

		return `${address_book.web_server}${request || '/'}`
	},
	error => `${address_book.web_server}/sign-in`)

	api.legacy.post('/legacy/register', async function({ request })
	{
		await register.apply(this, arguments)

		return new Url(`${address_book.web_server}/sign-in`)
			.set_parameters({ request })
			.print()
	},
	error => `${address_book.web_server}/register`)

	api.legacy.post('/legacy/locale', async function({ locale, from_url }, { set_cookie, user })
	{
		if (exists(user))
		{
			await store.update_locale(user.id, locale)
		}
		else
		{
			set_cookie('locale', locale, { signed: false })
		}

		return `${address_book.web_server}${from_url}`
	},
	error => `${address_book.web_server}/error`)
}