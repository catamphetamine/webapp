import { add_redirect } from '../helpers/redirection'
import { error as log_error } from '../redux/log'

export default function(error, { path, url, goto, dispatch })
{
	// Not authenticated
	if (error.status === 401)
	{
		return goto(add_redirect('/unauthenticated', url))
	}

	// Not authorized
	if (error.status === 403)
	{
		return goto(add_redirect('/unauthorized', url))
	}

	// Log the error if running on the server side
	if (_server_)
	{
		log.error(`Rendering error while executing an HTTP request for URL "${url}"`)
		log.error(error)
	}
	else
	{
		console.error(error)
		dispatch(log_error(error))
	}

	// some kind of server error happened

	// Show error stack trace in development mode
	if (process.env.NODE_ENV !== 'production')
	{
		throw error
	}

	// Prevents infinite redirect to the error page
	if (path === '/error')
	{
		throw error
	}

	// Redirect to a generic error page
	goto(add_redirect('/error', url))
}