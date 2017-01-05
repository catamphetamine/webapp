import web_service, { api as api_service, http } from 'web-service'

const validate_token_url = '/token/valid'

const common_options =
{
	keys : configuration.web_service_secret_keys,
	error_html : { font_size: '20pt' }
}

const authentication_options =
{
	authentication : configuration.authentication_token_payload.read,
	validate_token : async (token, ctx) =>
	{
		// Prevents recursion
		if (ctx.path === validate_token_url)
		{
			return { valid: true }
		}

		return await http.get
		(
			`${address_book.authentication_service}${validate_token_url}`,
			{ bot: ctx.query.bot },
			{ headers: { Authorization: `Bearer ${token}` } }
		)
	}
}

export function api(name, host_port, api_modules, options = {})
{
	return api_service
	({
		...common_options,
		...authentication_options,
		...options,
		api : api_modules,
		// `log` global variable has been defined by now
		log
	})
	.listen(host_port).then(() =>
	{
		const { host, port } = host_port
		log.info(`${name} is listening at http://${host || 'localhost'}:${port}`)
	},
	error =>
	{
		log.error(error, `${name} failed to start`)
	})
}

export default function webservice(options)
{
	options =
	{
		...common_options,
		...options,
		// `log` global variable has been defined by now
		log
	}

	if (options.authentication)
	{
		options =
		{
			...options,
			...authentication_options
		}
	}

	return web_service(options)
}