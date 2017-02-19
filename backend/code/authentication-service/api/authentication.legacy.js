import { http } from 'web-service'

import store from '../store/store'

import Url from '../../../../code/url'

// import { sign_in, sign_out } from './user.base'

export default function(api)
{
	// Sign in
	api.legacy.post('/legacy/sign-in', async function({ request })
	{
		const user = await sign_in.apply(this, arguments)

		return `${address_book.web_server}${request || '/'}`
	},
	error => `${address_book.web_server}/sign-in`)

	// Sign out
	api.legacy.post('/legacy/sign-out', async function()
	{
		await sign_out.apply(this, arguments)

		return `${address_book.web_server}/`
	},
	error => `${address_book.web_server}/error`)
}