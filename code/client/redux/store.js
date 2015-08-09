/* global __DEVELOPMENT__, __CLIENT__, __DEVTOOLS__ */
import { createStore, combineReducers, applyMiddleware, compose } from 'redux'
import asynchronous_middleware from './asynchronous middleware'

// "reducers" are actually "stores"
import * as reducers from '../action response handlers'

// transform each Json object to a switch function,
// and combine everything into a single reducer
const reducer = combineReducers(reducers)

export default function(client, data) 
{
	const middleware = asynchronous_middleware(client)
	
	let create_store

	if (_development_ && _client_ && _devtools_)
	{
		const { devTools, persistState } = require('redux-devtools')
		create_store = compose
		(
			applyMiddleware(middleware),
			devTools(),
			persistState(window.location.href.match(/[?&]debug_session=([^&]+)\b/)),
			createStore
		)
	} 
	else 
	{
		create_store = applyMiddleware(middleware)(createStore)
	}

	return create_store(reducer, data)
}
