// https://github.com/erikras/react-redux-universal-hot-example/blob/master/src/universalRouter.js
// Revision: Jul 23, 2015, abf052864d0ed65c3b11475e5a47a4d0f6206330

import React from 'react'
import Router from 'react-router'
import { Provider } from 'react-redux'

const get_preloader = (component = {}) =>
{
	return component.WrappedComponent ? 
		get_preloader(component.WrappedComponent) :
		component.preload
}

// this method has a bug: .preload() is called for each matching route in the path
// (e.g. "Application, About", not "About")
export function create_transition_hook(store)
{
	return (next_state, transition, callback) =>
	{
		const { params, location: { query } } = next_state

		Promise.all(next_state.branch
			// pull out individual route components
			.map(route => route.component)
			// only look at ones with a static fetchData()
			.map(get_preloader)
			// pull out fetch data methods
			.filter(preloader => exists(preloader))
			// call fetch data methods and save promises
			.map(preload => preload(store, params, query || {})))
			// finished
			.then(() => callback(), error => callback(error))
	}
}

export default function router({ location, history, store, routes })
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
		Router.run(routes, location, [create_transition_hook(store)], (error, initialState, transition) =>
		{
			if (error)
			{
				return reject(error)
			}

			if (transition && transition.redirectInfo)
			{
				return resolve
				({
					transition,
					redirect: true
				})
			}

			// only on client side
			if (history)
			{
				initialState.history = history
			}

			const component =
			(
				<Provider store={store} key="provider">
					{() => <Router {...initialState} children={routes}/>}
				</Provider>
			)

			return resolve
			({
				component,
				redirect: false
			})
		})
	})
}