import React          from 'react'
import Location       from 'react-router/lib/Location'

import router         from './router'

export function client({ development, development_tools, routes, history, store, content_container })
{
	const location = new Location(document.location.pathname, document.location.search)

	const promise = router({ location, routes, history, store })
		.then(({ component }) =>
		{
			if (development_tools)
			{
				const { DevTools, DebugPanel, LogMonitor } = require('redux-devtools/lib/react')

				console.info('You will see a "Warning: React attempted to reuse markup in a container but the checksum was' +
					' invalid." message. That\'s because the redux-devtools are enabled.')

				React.render
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
			else
			{
				React.render(component, content_container)
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
	const location = new Location(request.path, request.query)

	if (disable_server_side_rendering)
	{
		return Promise.resolve({ markup: '<!doctype html>\n' +
			React.renderToString(html.without_rendering(store)) })
	}
	
	return router({ location, store, routes })
		.then(({ component, transition, redirect }) =>
		{
			if (redirect)
			{
				return { redirect_to: response.redirect(transition.redirectInfo.pathname) }
			}

			return { markup: '<!doctype html>\n' +
				React.renderToString(html.with_rendering(component, store)) }
		})
}