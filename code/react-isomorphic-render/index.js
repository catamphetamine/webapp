import query_string from 'query-string'

import React                 from 'react'
import ReactDOM              from 'react-dom'
import ReactDOMServer        from 'react-dom/server'
import create_location       from 'history/lib/createLocation'
import create_history        from 'history/lib/createBrowserHistory'
// import create_memory_history from 'history/lib/createMemoryHistory'
import router                from './router'

export function client({ development, development_tools, routes, store, content_container })
{
	// let query = document.location.search
	// query = query && query_string.parse(query)
	// const location = create_location(document.location.pathname, query)
  
	const location = create_location(document.location.pathname, document.location.search)
	const history = create_history()

	const promise = router({ location, history, routes, store })
		.then(({ component }) =>
		{
			// Render dev tools after initial client render to prevent warning
			// "React attempted to reuse markup in a container but the checksum was invalid"
			// https://github.com/erikras/react-redux-universal-hot-example/pull/210
			ReactDOM.render(component, content_container)

			if (development_tools)
			{
				const { DevTools, DebugPanel, LogMonitor } = development_tools

				ReactDOM.render
				(
					<div>
						{component}
						<DebugPanel top right bottom key="debugPanel">
							<DevTools store={store} monitor={LogMonitor}/>
						</DebugPanel>
					</div>,
					content_container
				)
			}
		},
		(error) =>
		{
			console.error(error)
		})

	if (development)
	{
		window.React = React // enable debugger
		const reactRoot = window.document.getElementById('content')

		if (!reactRoot || !reactRoot.firstChild || !reactRoot.firstChild.attributes || !reactRoot.firstChild.attributes['data-react-checksum'])
		{
			console.error('Server-side React render was discarded. Make sure that your initial render does not contain any client-side code.')
		}
	}

	return promise
}

export function server({ disable_server_side_rendering, html, store, routes, request })
{
	// const history = create_memory_history()
	const location = create_location(request.path, request.query)

	const markup = () =>
	{
		return '<!doctype html>\n' + ReactDOMServer.renderToString(html.without_rendering(store))
	}

	if (disable_server_side_rendering)
	{
		return Promise.resolve({ markup: markup() })
	}

	// , history
	return router({ location, routes, store, preload: true })
		.then(({ component, redirect }) =>
		{
			if (redirect)
			{
				return { redirect_to: response.redirect(redirect) }
			}

			return { markup: '<!doctype html>\n' +
				ReactDOMServer.renderToString(html.with_rendering(component, store)) }
		})

		// // swallows errors
		// .catch(error => !error.redirect, error =>
		// {
		// 	console.error(error)
		// 	error.markup = markup() // let client render error page or re-request data
		// 	throw error
		// })
}