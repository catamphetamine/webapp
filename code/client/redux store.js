import { create_store } from 'react-isomorphic-render/redux'
import on_error         from './helpers/error handler'

import create_logger    from 'redux-logger'

export default function(options)
{
	const middleware = middleware =>
	{
		// enable Redux event logging here
		// middleware.push(create_logger())
		return middleware
	}

	const { store, reload } = create_store(() => require('./model'), { ...options, on_preload_error: on_error, middleware })

	// (for Webpack users only)
	//
	// client side hot module reload for Redux reducers
	// http://webpack.github.io/docs/hot-module-replacement.html#accept
	if (_development_ && module.hot)
	{
		// this path must be equal to the path in the `require()` call in `create_store` above
		module.hot.accept('./model', reload)
	}

	return store
}