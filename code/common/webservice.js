import web_service, { api as api_service, http } from 'web-service'

const validate_token_url = '/validate-token'

const authentication_options =
{
	authentication : configuration.authentication_token_payload.read,
	validate_token : async (token, ctx) =>
	{
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
		...options,
		log,
		api  : api_modules,
		keys : configuration.web_service_secret_keys,
		...authentication_options
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
		...options,
		log,
		keys : configuration.web_service_secret_keys
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