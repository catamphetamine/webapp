// https://github.com/erikras/react-redux-universal-hot-example/blob/master/src/universalRouter.js
// Revision: Jul 23, 2015, abf052864d0ed65c3b11475e5a47a4d0f6206330

import React from 'react'
import { Router, RoutingContext, match } from 'react-router'

const get_preloader = (component = {}) =>
{
	return component.WrappedComponent ? 
		get_preloader(component.WrappedComponent) :
		component.preload
}

export default function router({ location, history, routes, preload })
{
	return new Promise((resolve, reject) =>
	{
		if (typeof routes === 'function')
		{
			routes = routes() // , history
		}

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

				resolve({ component: markup })
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
					.map(preloader => preload(preloader))) //, params, query || {})))
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