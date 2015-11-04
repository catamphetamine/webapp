import query_string from 'query-string'

import React                 from 'react'
import ReactDOM              from 'react-dom'
import ReactDOMServer        from 'react-dom/server'
// import create_history        from 'history/lib/createBrowserHistory'
// import create_memory_history from 'history/lib/createMemoryHistory'
// import router                from './router'

import { match } from 'redux-router/server'
import { ReduxRouter } from 'redux-router'

export function client({ development, wrap_component, routes, content_container })
{
	// let query = document.location.search
	// query = query && query_string.parse(query)
	// const location = create_location(document.location.pathname, query)

	// const history = create_history()
	// const location = history.createLocation(document.location.pathname, document.location.search)

	// const promise = router({ location, history, routes })
	// 	.then(({ component }) =>
	// 	{
	// 		ReactDOM.render(wrap_component(component), content_container)
	// 	},
	// 	(error) =>
	// 	{
	// 		console.error(error.stack || error)
	// 	})

		const Router = require('react-router').Router
	const component =
	(
		<ReduxRouter routes={routes} />
		// <Router routes={routes} />
	)

	ReactDOM.render(wrap_component(component), content_container)

	if (development)
	{
		window.React = React // enable debugger
		// const reactRoot = content_container // window.document.getElementById('content')

		if (!content_container || !content_container.firstChild || !content_container.firstChild.attributes || !content_container.firstChild.attributes['data-react-checksum'])
		{
			console.error('Server-side React render was discarded. Make sure that your initial render does not contain any client-side code.')
		}
	}
}

export function server({ disable_server_side_rendering, wrap_component, html, url, store }) // , routes, preload
{
	// const history = create_memory_history()
	// // // const history = create_history()
	// const location = history.createLocation(request.originalUrl)
	// // // const location = history.createLocation(request.path, request.query)

	const location = url

	const markup = () =>
	{
		return '<!doctype html>\n' + ReactDOMServer.renderToString(html.without_rendering())
	}

	if (disable_server_side_rendering)
	{
		return Promise.resolve({ markup: markup() })
	}

	// match(location, (error, redirectLocation, routerState) => 
	// {
	// })



	return new Promise((resolve, reject) =>
	{
		// , history
		console.log('@@@@@@@@@', location)
		store.dispatch(match(location, (error, redirect_location, router_state) =>
		{
			if (redirect_location)
			{
				return resolve
				({
					redirect: redirect_location.pathname + redirect_location.search
				})
			}

			if (error)
			{
				return reject(error)
			}

			if (!router_state)
			{
				return reject(new Error('No router state'))
			}

			// Workaround redux-router query string issue:
			// https://github.com/rackt/redux-router/issues/106
			if (router_state.location.search && !router_state.location.query)
			{
				router_state.location.query = query_string.parse(router_state.location.search)
			}

			const get_status_from_routes = matched_routes =>
			{
				return matched_routes.reduce((previous, current) => current.status || previous, null)
			}

			store.getState().router.then(() => 
			{
				const component =
				(
					<ReduxRouter/>
				)

				const status = get_status_from_routes(router_state.routes)

				resolve({ status: status, markup: '<!doctype html>\n' +
					ReactDOMServer.renderToString(html.with_rendering(wrap_component(component))) })
			})
			.catch(error =>
			{
				// log.error(error)
				error.markup = markup() // let client render error page or re-request data
				throw error
			})
		}))
	})
}