import query_string from 'query-string'

import React                 from 'react'
import ReactDOM              from 'react-dom'
import ReactDOMServer        from 'react-dom/server'
import create_history        from 'history/lib/createBrowserHistory'
import create_memory_history from 'history/lib/createMemoryHistory'
import router                from './router'

export function client({ development, wrap_component, routes, store, content_container })
{
	// let query = document.location.search
	// query = query && query_string.parse(query)
	// const location = create_location(document.location.pathname, query)

	const history = create_history()
	const location = history.createLocation(document.location.pathname, document.location.search)

	const promise = router({ location, history, routes })
		.then(({ component }) =>
		{
			ReactDOM.render(wrap_component(component), content_container)
		},
		(error) =>
		{
			console.error(error.stack || error)
		})

	if (development)
	{
		window.React = React // enable debugger
		const reactRoot = content_container // window.document.getElementById('content')

		if (!reactRoot || !reactRoot.firstChild || !reactRoot.firstChild.attributes || !reactRoot.firstChild.attributes['data-react-checksum'])
		{
			console.error('Server-side React render was discarded. Make sure that your initial render does not contain any client-side code.')
		}
	}

	return promise
}

export function server({ disable_server_side_rendering, wrap_component, html, routes, request, preload })
{
	// const history = create_memory_history()
	// // const history = create_history()
	// const location = history.createLocation(request.originalUrl)
	// // const location = history.createLocation(request.path, request.query)

	const markup = () =>
	{
		return '<!doctype html>\n' + ReactDOMServer.renderToString(html.without_rendering())
	}

	if (disable_server_side_rendering)
	{
		return Promise.resolve({ markup: markup() })
	}

	// , history
	return router({ location: request.originalUrl, routes, preload }) // , location
		.then(({ component, redirect }) =>
		{
			if (redirect)
			{
				return { redirect_to: response.redirect(redirect) }
			}

			return { markup: '<!doctype html>\n' +
				ReactDOMServer.renderToString(html.with_rendering(wrap_component(component))) }
		})

		// // swallows errors
		// .catch(error => !error.redirect, error =>
		// {
		// 	console.error(error)
		// 	error.markup = markup() // let client render error page or re-request data
		// 	throw error
		// })
}