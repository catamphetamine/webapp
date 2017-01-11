import * as reducer from './reducers'
import routes  from './routes'
import wrapper from './wrapper'

// import create_logger from 'redux-logger'
import error_handler from './helpers/error handler'
import async_settings from './react-isomorphic-render-async'

if (module.hot)
{
	module.hot.accept('./routes', () => alert('hot routes'))
}

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

	// redux_middleware()
	// {
	// 	// enable Redux event logging here
	// 	// return [create_logger()]
	// },

	preload:
	{
		catch: error_handler
	},

	...async_settings
}