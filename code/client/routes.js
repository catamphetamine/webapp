import React from 'react'

// import Relay from 'react-relay'
// npm install react@^0.14.0 --save

import { Router, Route, IndexRoute } from 'react-router'

// import RelayNestedRoutes from 'relay-nested-routes'
// // maybe move this to the function (if needed)
// const NestedRootContainer = RelayNestedRoutes(React, Relay)

import Layout    from './pages/layout.js'
import Editor    from './pages/editor.js'
import About     from './pages/about.js'
import Home      from './pages/home.js'
import Showcase  from './pages/showcase.js'
import Not_found from './pages/not found.js'
import Dialog    from './pages/showcase/dialog.js'
import Form      from './pages/showcase/form.js'

const Layout_queries = 
{
}

const Home_queries = 
{
	// widget: (React.Component) => Relay.QL`
	// query {
	// 	node(id: $id) {
	// 		${Component.getFragment('widget')},
	// 	}
	// }
	// `
}

		// <Route component={NestedRootContainer}>
		// </Route>

export default function({ store, history })
{
	// <Route ... history={history}

	const routes =
	(
		<Route path="/" component={Layout} queries={Layout_queries}>
			<IndexRoute component={Home} queries={Home_queries}/>
			<Route path="editor" component={Editor}/>
			<Route path="about" component={About}/>
			<Route path="showcase" component={Showcase}>
				<Route path="dialog" component={Dialog}/>
				<Route path="form" component={Form}/>
			</Route>
			<Route path="*" component={Not_found}/>
		</Route>
	)

			// <Route component={Require_login} onEnter={Require_login.on_enter(store)}>
			// 	<Route path="/login_success" component={Login_success}/>
			// </Route>

	return routes
}