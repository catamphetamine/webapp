import { createStore, combineReducers, applyMiddleware, compose } from 'redux'
import asynchronous_middleware from './asynchronous middleware'

// "reducers" are actually "stores"
// import * as reducers from '../action response handlers'

export default function(api_client, data) 
{
	const middleware = asynchronous_middleware(api_client)
	
	let create_store

	if (_development_ && _client_ && _development_tools_)
	{
		const { devTools, persistState } = require('redux-devtools')
		create_store = compose
		(
			applyMiddleware(middleware),
			// Provides support for DevTools:
			devTools(),
			// Lets you write ?debug_session=<name> in address bar to persist debug sessions
			persistState(window.location.href.match(/[?&]debug_session=([^&]+)\b/))
		)
		(createStore)
	} 
	else 
	{
		create_store = applyMiddleware(middleware)(createStore)
	}

	const reducer = combineReducers(require('../action response handlers'))
	const store = create_store(reducer, data)
	// store.client = api_client

	if (module.hot)
	{
		module.hot.accept('../action response handlers', () =>
		{
			const next_reducer = combineReducers(require('../action response handlers'))
			store.replaceReducer(next_reducer)
		})
	}

	return store
}
