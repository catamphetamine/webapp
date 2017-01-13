import { goto } from 'react-isomorphic-render'

import { add_redirect } from '../helpers/redirection'
import { error as log_error } from '../actions/log'

export default function(error, { path, url, dispatch })
{
	// not authenticated
	if (error.status === 401)
	{
		return dispatch(goto(add_redirect('/unauthenticated', url)))
	}

	// not authorized
	if (error.status === 403)
	{
		return dispatch(goto(add_redirect('/unauthorized', url)))
	}

	// log the error if running on the server side
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

	// show error stack trace in development mode
	if (process.env.NODE_ENV !== 'production')
	{
		throw error
	}

	// prevents infinite redirect to the error page
	if (path === '/error')
	{
		throw error
	}

	// redirect to the generic error page
	dispatch(goto(add_redirect('/error', url)))
}