import message_store from './../message store'
import IP_limiter    from '../../../../code/ip limiter'

// Limits requests for every client IP-address to `5` per second
const ip_limiter = new IP_limiter(5)

export default function(api)
{
	api.get('/', function({}, {user})
	{
		this.role('administrator')

		return message_store.messages.clone().reverse()
	})

	// Receiving client-side errors here.
	//
	// Anyone can post, so this is kinda security hole,
	// but I guess better this than to loose
	// errors happening in users' web browsers.
	//
	api.post('/', function(message, { ip })
	{
		if (!ip_limiter.passes(ip))
		{
			// set_header('Retry-After', ...)
			throw new errors.Too_many_requests()
		}

		message.ip   = ip
		message.name = 'client side'
		message.time = new Date().toString()

		return message_store.add(message)
	})
}