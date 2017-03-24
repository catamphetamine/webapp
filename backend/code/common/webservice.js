import web_service, { api as api_service, http } from 'web-service'

const validate_token_url = '/valid'

const common_options =
{
	keys : configuration.web_service_secret_keys,
	error_html : { font_size: '20pt' }
}

const authentication_options = (is_access_token_service) =>
({
	authentication : configuration.access_token_payload.read,
	validate_token : async (token, ctx) =>
	{
		// Prevents recursion
		if (is_access_token_service && ctx.path === validate_token_url)
		{
			return { valid: true }
		}

		return await http.get
		(
			`${address_book.access_token_service}${validate_token_url}`,
			{ bot: ctx.query.bot },
			{ headers: { Authorization: `Bearer ${token}` } }
		)
	}
})

export function api(name, host_port, api_modules, options = {})
{
	return api_service
	({
		...common_options,
		...authentication_options(options.is_access_token_service),
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