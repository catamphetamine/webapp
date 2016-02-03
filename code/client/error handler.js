export default function(error, { url, redirect, proceed })
{
	// `url` will be passed as a Url parameter
	const request = encodeURIComponent(url)

	// not authenticated
	if (error.status === 401)
	{
		return redirect(`/unauthenticated?request=${request}`)
	}

	// not authorized
	if (error.status === 403)
	{
		return redirect(`/unauthorized?request=${request}`)
	}

	// log the error if running on the server side
	if (_server_)
	{
		log.error(`Rendering error while fetching url "${url}"`)
		log.error(error)
	}

	// some kind of server error happened
	redirect(`/error?request=${request}`)
}