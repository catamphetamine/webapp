import { add_redirect } from '../helpers/redirection'
import { error as log_error } from '../actions/log'

export default function(error, { url, redirect, dispatch })
{
	// not authenticated
	if (error.status === 401)
	{
		return redirect(add_redirect('/unauthenticated', url))
	}

	// not authorized
	if (error.status === 403)
	{
		return redirect(add_redirect('/unauthorized', url))
	}

	// log the error if running on the server side
	if (_server_)
	{
		log.error(`Rendering error while executing an http request for url "${url}"`)
		log.error(error)
	}
	else
	{
		console.error(error)
		dispatch(log_error(error))
	}

	// some kind of server error happened

	// show error stack trace in development mode
	if (_development_)
	{
		throw error
	}

	// prevents infinite redirect to the error page
	if (url.starts_with('/error?'))
	{
		throw error
	}

	// redirect to the generic error page
	redirect(add_redirect('/error', url))
}