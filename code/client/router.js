// https://github.com/erikras/react-redux-universal-hot-example/blob/master/src/universalRouter.js
// Revision: Jul 23, 2015, abf052864d0ed65c3b11475e5a47a4d0f6206330

import React from 'react'
import Router from 'react-router'
import { Provider } from 'react-redux'

import routes from './routes'

const get_preloaders = (component) =>
{
	return component.preload || (component.DecoratedComponent && component.DecoratedComponent.preload)
}

export function create_transition_hook(store)
{
	return (next_state, transition, callback) =>
	{
		Promise.all(next_state.branch
			.map(route => route.component)
			.map(get_preloaders)
			.filter(preloader => preloader)
			.map(preload => preload(store, next_state.params)))
			// can't just pass callback to then() because callback assumes first param is error
			.then(() => callback(), (error) => callback(error))
	}
}

export default function universal_router(location, history, store)
{
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