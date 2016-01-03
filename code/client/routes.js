import React from 'react'

// import Relay from 'react-relay'
// npm install react@^0.14.0 --save

import { Router, Route, IndexRoute } from 'react-router'

// import RelayNestedRoutes from 'relay-nested-routes'
// // maybe move this to the function (if needed)
// const NestedRootContainer = RelayNestedRoutes(React, Relay)

import Layout           from './pages/layout'
import Not_found        from './pages/not found'
import Editor           from './pages/editor'
import About            from './pages/about'
import Home             from './pages/home'
import Showcase         from './pages/showcase'
import Dialog_showcase  from './pages/showcase/dialog'
import Form_showcase    from './pages/showcase/form'
import Example          from './pages/example'
import Simple_example   from './pages/example/simple example'
import Database_example from './pages/example/database example'
import Log              from './pages/log'
import Simple_graphQL_example  from './pages/example/simple graphql example'

// playing with GraphQL/Relay a bit

const Layout_queries = {}

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

export default function(store)
{
	const routes =
	(
		<Route path="/" component={Layout} queries={Layout_queries}>
			<IndexRoute component={Home} queries={Home_queries}/>
			<Route path="editor" component={Editor}/>
			{/*<Route path="about" component={About}/>*/}
			<Route path="example" component={Example}>
				<Route path="simple" component={Simple_example}/>
				<Route path="database" component={Database_example}/>
				<Route path="graphql" component={Simple_graphQL_example}/>
			</Route>
			<Route path="showcase" component={Showcase}>
				<Route path="dialog" component={Dialog_showcase}/>
				<Route path="form" component={Form_showcase}/>
			</Route>
			<Route path="logs" component={Log}/>
			<Route path="*" component={Not_found}/>
		</Route>
	)

	return routes
}