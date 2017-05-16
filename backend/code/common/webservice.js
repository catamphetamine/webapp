import web_service, { api as api_service, http } from 'web-service'

const refresh_token_path = '/refresh'
const record_access_path = '/record-access'

const common_options =
{
	keys : configuration.web_service_secret_keys,
	error_html : { font_size: '20pt' }
}

export const authentication_options = (is_access_token_service) =>
({
	authentication:
	{
		userInfo : configuration.access_token_payload.read,

		validateAccessToken(payload, ctx)
		{
			if (payload.audience === 'access-token-service' && !is_access_token_service)
			{
				return false
			}

			return true
		},

		refreshAccessToken : async (ctx) =>
		{
			const refresh_token = ctx.cookies.get(configuration.access_token_refresh_cookie)

			if (!refresh_token)
			{
				throw new Error('Refresh token not found')
			}

			const token = await http.post
			(
				`${address_book.access_token_service}${refresh_token_path}`,
				{},
				{ headers: { Authorization: `Bearer ${refresh_token}` } }
			)

			// Set the cookie to expire in January 2038 (the fartherst it can get)
			// http://stackoverflow.com/questions/3290424/set-a-cookie-to-never-expire
			ctx.cookies.set(configuration.access_token_cookie, token,
			{
				expires  : new Date(2147483647000),
				httpOnly : false,
				signed   : false
			})

			return token
		},

		onUserRequest(token, ctx)
		{
			// Prevents recursion
			if (is_access_token_service && ctx.path === record_access_path)
			{
				return
			}

			// Don't track access token refresh
			// (also `user.access_token_id` is `undefined` in those cases)
			if (is_access_token_service && ctx.path === refresh_token_path)
			{
				return
			}

			if (ctx.query.bot)
			{
				return
			}

			// Update this authentication token's last access IP and time
			try
			{
				http.post
				(
					`${address_book.access_token_service}${record_access_path}`,
					{},
					{ headers: { Authorization: `Bearer ${token}` } }
				)
			}
			// Recording user access is assumed to be non-critical operation
			catch (error)
			{
				log.error(error)
			}
		}
	}
})

export function api(name, host_port, api_modules, options = {})
{
	const service = api_service
	({
		...common_options,
		...authentication_options(options.is_access_token_service),
		...options,
		api : api_modules,
		// `log` global variable has been defined by now
		log
	})

	return service.listen(host_port).then(() =>
	{
		const { host, port } = host_port
		log.info(`${name} is listening at http://${host || 'localhost'}:${port}`)

		return service
	},
	(error) =>
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