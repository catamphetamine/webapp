import routes  from './routes'
import wrapper from './wrapper'

import create_logger from 'redux-logger'
import error_handler from './helpers/error handler'

export default
{
	// Redux reducer
	// (either an object or a function returning an object)
	reducer: () => require('./reducers'),

	// React-router routes
	// (either a `<Route/>` element or a `function({ store })` returning a `<Route/>` element)
	routes,

	// Wraps React page component with arbitrary elements (e.g. <Provider/>, etc; see an example below)
	wrapper,

	// redux_middleware()
	// {
	// 	// enable Redux event logging here
	// 	// return [create_logger()]
	// },

	preload:
	{
		catch: error_handler
	},

	on_store_created({ reload_reducer })
	{
		// (for Webpack users only)
		//
		// client side hot module reload for Redux reducers
		// http://webpack.github.io/docs/hot-module-replacement.html#accept
		if (_development_ && module.hot)
		{
			// this path must be equal to the path in the `require()` call in `create_store` above
			module.hot.accept('./reducers', reload_reducer)
		}
	}
}