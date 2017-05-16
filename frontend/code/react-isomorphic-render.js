import * as reducer from './redux'
import routes  from './routes'
import wrapper from './wrapper'

// import create_logger from 'redux-logger'
// import redux_thunk from 'redux-thunk'

import error_handler from './helpers/error handler'
import async_settings from './react-isomorphic-render-async'

export default
{
	// Redux reducer
	// (either an object or a function returning an object)
	reducer,

	// React-router routes
	// (either a `<Route/>` element or a `function({ store })` returning a `<Route/>` element)
	routes,

	// Wraps React page component with arbitrary elements (e.g. <Provider/>, etc; see an example below)
	wrapper,

	authentication:
	{
		// Not using "refresh token" on the client side at all.
		// protectedCookie: _access_token_refresh_cookie_,

		accessToken(get_cookie)
		{
			return get_cookie(_access_token_cookie_)
		}
	},

	// redux_middleware()
	// {
	// 	// enable Redux event logging here
	// 	// return [create_logger()]
	// 	return [redux_thunk]
	// },

	error: error_handler,

	...async_settings
}