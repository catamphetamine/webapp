import jwt    from 'jsonwebtoken'

import http   from '../../common/http'
import Url    from '../../client/tools/url'

import { store, online_status_store } from '../store'

import { sign_in, sign_out, register, public_user } from './authentication.base'

api.legacy.post('/legacy/sign-in', async function({ request })
{
	const user = await sign_in.apply(this, arguments)

	return `${address_book.web_server}${request || '/'}`
},
error => `${address_book.web_server}/sign-in`)

api.legacy.post('/legacy/sign-out', async function()
{
	await sign_out.apply(this, arguments)

	return `${address_book.web_server}/`
},
error => `${address_book.web_server}/error`)

api.legacy.post('/legacy/register', async function({ request })
{
	await register.apply(this, arguments)

	return new Url(`${address_book.web_server}/sign-in`)
		.set_parameters({ request })
		.print()
},
error => `${address_book.web_server}/register`)