import { sign_out } from './authentication.base'

export default function(api)
{
	api.legacy.post('/legacy/sign-out', async function()
	{
		await sign_out.apply(this, arguments)

		return `${address_book.web_server}/`
	},
	error => `${address_book.web_server}/error`)
}