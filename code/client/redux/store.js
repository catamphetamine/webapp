import { createStore, combineReducers, applyMiddleware, compose } from 'redux'
import asynchronous_middleware from './asynchronous middleware'
import transition_middleware from './transition middleware';

import dev_tools from './dev tools'

import { routerStateReducer } from 'redux-router'

import routes from '../routes'

import { createRoutes } from 'react-router/lib/RouteUtils'

import { reduxReactRouter as reduxReactRouter_client } from 'redux-router'
import { reduxReactRouter as reduxReactRouter_server } from 'redux-router/server'

import createHistory_server from 'history/lib/createMemoryHistory'
import createHistory_client from 'history/lib/createBrowserHistory'

// Wrap the hooks so they don't fire if they're called before
// the store is initialised. This only happens when doing the first
// client render of a route that has an onEnter hook
function makeHooksSafe(routes, store)
{
	if (Array.isArray(routes))
	{
		return routes.map((route) => makeHooksSafe(route, store))
	}

	const onEnter = routes.onEnter

	if (onEnter)
	{
		routes.onEnter = function safeOnEnter(...args)
		{
			try
			{
				store.getState()
			}
			catch (err)
			{
				if (onEnter.length === 3)
				{
					args[2]();
				}

				// There's no store yet so ignore the hook
				return
			}

			onEnter.apply(null, args);
		}
	}

	if (routes.childRoutes)
	{
		makeHooksSafe(routes.childRoutes, store);
	}

	if (routes.indexRoute)
	{
		makeHooksSafe(routes.indexRoute, store);
	}

	return routes
}

function makeRouteHooksSafe(_getRoutes)
{
	return store => makeHooksSafe(createRoutes(_getRoutes(store)), store)
}

export default function(api_client, http_client, data) 
{
	const getRoutes = _server_ ? routes : makeRouteHooksSafe(routes)
	const reduxReactRouter = _server_ ? reduxReactRouter_server : reduxReactRouter_client
	const createHistory = _server_ ? createHistory_server : createHistory_client

	const middleware = [asynchronous_middleware(api_client, http_client), transition_middleware]
	
	let create_store

	if (_development_ && _client_ && _development_tools_)
	{
		const { persistState } = require('redux-devtools')

		create_store = compose
		(
			applyMiddleware(...middleware),
			// Provides support for DevTools:
			dev_tools.instrument(),
			// Lets you write ?debug_session=<name> in address bar to persist debug sessions
			persistState(window.location.href.match(/[?&]debug_session=([^&]+)\b/))
		)
		(createStore)
	} 
	else 
	{
		create_store = applyMiddleware(...middleware)(createStore)
	}

	// keeps react-router state in Redux
	create_store = reduxReactRouter({ getRoutes, createHistory })(create_store)

	const overall_reducer = () =>
	{
		const model = require('../model')
		model.router = routerStateReducer
		return combineReducers(model)
	}

	const store = create_store(overall_reducer(), data)
	
	if (_development_ && module.hot)
	{
		module.hot.accept('../model', () =>
		{
			// check if this works (maybe place require(...) here otherwise)
			store.replaceReducer(overall_reducer())
		})
	}

	return store
}
