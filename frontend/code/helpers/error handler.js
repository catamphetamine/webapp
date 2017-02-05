import { add_redirect } from '../helpers/redirection'
import { error as log_error } from '../redux/log'

export default function(error, { path, url, redirect, dispatch, getState, server })
{
	// Not authenticated
	if (error.status === 401)
	{
		return redirect(add_redirect('/unauthenticated', url))
	}

	// Not authorized
	if (error.status === 403)
	{
		return redirect(add_redirect('/unauthorized', url))
	}

	// Log the error
	if (server)
	{
		log.error(`Error while preloading "${url}"`)
		log.error(error)
	}
	else
	{
		console.error(error)
		dispatch(log_error(error))
	}

	// In development mode don't redirect to the error page
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
	redirect(add_redirect('/error', url))
}