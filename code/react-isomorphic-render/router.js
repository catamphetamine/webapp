// https://github.com/erikras/react-redux-universal-hot-example/blob/master/src/universalRouter.js
// Revision: Jul 23, 2015, abf052864d0ed65c3b11475e5a47a4d0f6206330

import React from 'react'
import { Router, RoutingContext, match } from 'react-router'
import { Provider } from 'react-redux'

const get_preloader = (component = {}) =>
{
	return component.WrappedComponent ? 
		get_preloader(component.WrappedComponent) :
		component.preload
}

export default function router({ location, history, store, routes, preload })
{
	if (typeof routes === 'function')
	{
		routes = routes(store)
	}

	// if (!(routes instanceof ...))
	// {
	// 	if (typeof routes === 'function')
	// 	{
	// 		routes = routes(store)
	// 	}
	// 	else
	// 	{
	// 		throw new Error('Invalid routes passed: must be a react object or function')
	// 	}
	// }

	return new Promise((resolve, reject) =>
	{
		match({ routes, history, location }, (error, redirect_location, render_props) =>
		{
			if (error)
			{
				return reject(error)
			}

			if (redirect_location)
			{
				return resolve
				({
					redirect: redirect_location.pathname + redirect_location.search
				})
			}

			// used only on client for <Router history={history} ...>
			if (history)
			{
				render_props.history = history
			}

			function finish()
			{
				let markup

				if (_server_)
				{
					markup = (<RoutingContext {...render_props}/>)
				}
				else
				{
					markup = React.createElement(Router, render_props)
				}

				const component =
				(
					<Provider store={store} key="provider">
						{markup}
					</Provider>
				)

				resolve({ component })
			}

			if (preload)
			{
				// const { params, location: { query } } = next_state

				Promise.all(render_props.components
					// only look at ones with a static fetchData()
					.map(get_preloader)
					// pull out fetch data methods
					.filter(preloader => exists(preloader))
					// call fetch data methods and save promises
					.map(preload => preload(store))) //, params, query || {})))
					// finished
					.then(() => finish(), error => reject(error))
			}
			else
			{
				finish()
			}
		})
	})
}