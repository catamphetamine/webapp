import Url from '../tools/url'

// user is supposed to be redirected to this url 
// after calling this function
export function should_redirect_to(location)
{
	return redirection_target(location) || '/'
}

// gets the `request` parameter from the url
export function redirection_target(location)
{
	return location.query.request
}

// adds `request` parameter to the Url
// so that redirection to `request` can happen eventually
export function add_redirect(base_url, location)
{
	const url = new Url(base_url)

	if (is_object(location))
	{
		// if `location` is an object, then 
		// `request` parameter is supposed to be passed on further

		if (location.query.request)
		{
			// if there is already `request` parameter in current Url,
			// then just copy it to the new Url
			//
			url.parameter('request', location.query.request)
		}
		else
		{
			// else, add the `request` parameter to the Url
			// (`request` = current Url)
			// in case it's not a Sign-in or Register page
			//
			switch (location.pathname)
			{
				// case '/sign-in':
				// case '/register':
				// 	break

				default:
					url.parameter('request', location.pathname + (location.search ? '?' + location.search : ''))
			}
		}
	}
	else
	{
		// if `location` is a string, then 
		// `request` parameter is supposed to be set initially	

		// (don't set the `request` parameter 
		//  if it's gonna be a Sign-in or Register page)
		//
		const location_url = new Url(location)
		switch (location_url.path)
		{
			// case '/sign-in':
			// case '/register':
			// 	break

			default:
				url.parameter('request', location)
		}
	}

	return url.print()
}