import React from 'react'

// import Relay from 'react-relay'
// npm install react@^0.14.0 --save

import { Router, Route, IndexRoute } from 'react-router'

// import RelayNestedRoutes from 'relay-nested-routes'
// // maybe move this to the function (if needed)
// const NestedRootContainer = RelayNestedRoutes(React, Relay)

import Layout           from './pages/layout.js'
import Not_found        from './pages/not found.js'
import Editor           from './pages/editor.js'
import About            from './pages/about.js'
import Home             from './pages/home.js'
import Showcase         from './pages/showcase.js'
import Dialog_showcase  from './pages/showcase/dialog.js'
import Form_showcase    from './pages/showcase/form.js'
import Example          from './pages/example.js'
import Simple_example   from './pages/example/simple example.js'
import Database_example from './pages/example/database example.js'
import Simple_graphQL_example  from './pages/example/simple graphql example.js'

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

export default function({ store })
{
	const routes =
	(
		<Route path="/" component={Layout} queries={Layout_queries}>
			<IndexRoute component={Home} queries={Home_queries}/>
			<Route path="editor" component={Editor}/>
			<Route path="about" component={About}/>
			<Route path="example" component={Example}>
				<Route path="simple" component={Simple_example}/>
				<Route path="database" component={Database_example}/>
				<Route path="graphql" component={Simple_graphQL_example}/>
			</Route>
			<Route path="showcase" component={Showcase}>
				<Route path="dialog" component={Dialog_showcase}/>
				<Route path="form" component={Form_showcase}/>
			</Route>
			<Route path="*" component={Not_found}/>
		</Route>
	)

	return routes
}