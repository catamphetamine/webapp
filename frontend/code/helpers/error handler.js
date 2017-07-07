import { add_redirect } from '../helpers/redirection'
import { error as log_error } from '../redux/log'

export default function(error, { path, url, redirect, dispatch, getState, server })
{
	// Not authenticated
	if (error.status === 401)
	{
		// Prevent double redirection to `/unauthenticated`.
		// (e.g. when two parallel `Promise`s load inside `@preload()`
		//  and both get Status 401 HTTP Response)
		if (typeof window !== 'undefined' && window.location.pathname === '/unauthenticated')
		{
			return
		}

		return redirect(add_redirect('/unauthenticated', url))
	}

	// Not authorized
	if (error.status === 403)
	{
		return redirect(add_redirect('/unauthorized', url))
	}

	// Not found
	if (error.status === 404)
	{
		return redirect(add_redirect('/not-found', url));
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

	// Redirect to the error page in production
	if (process.env.NODE_ENV === 'production')
	{
		// Prevents infinite redirect to the error page
		// in case of overall page rendering bugs, etc.
		if (path !== '/error')
		{
			// Redirect to a generic error page
			return redirect(add_redirect('/error', url))
		}
	}
}