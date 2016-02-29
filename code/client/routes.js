// Since this file is `require()`d both on client and server,
// i'm putting this workaround here.
//
// It disables noisy React-intl default messages warnings in the console
// ("using default message as fallback")
// https://github.com/yahoo/react-intl/issues/251
//
// an alternative solution is to add this to .babelrc
//
// ["react-intl", 
// {
// 	"messagesDir": "./build/messages/",
// 	"enforceDescriptions": true
// }]
//
// and then use something like this 
// to convert those `.json`s into a proper translations file
// https://github.com/yahoo/react-intl/blob/master/examples/translations/scripts/translate.js
//
if (_development_)
{
	const console_error = console.error
	console.error = (...parameters) =>
	{
		if (!parameters[0].starts_with('[React Intl] Missing message:'))
		{
			console_error.call(console, ...parameters)
		}
	}
}

import React from 'react'

// import Relay from 'react-relay'
// npm install react@^0.14.0 --save

import { Router, Route, IndexRoute } from 'react-router'

// import RelayNestedRoutes from 'relay-nested-routes'
// // maybe move this to the function (if needed)
// const NestedRootContainer = RelayNestedRoutes(React, Relay)

import Layout           from './pages/layout'
import Not_found        from './pages/errors/not found'
import Unauthenticated  from './pages/errors/unauthenticated'
import Unauthorized     from './pages/errors/unauthorized'
import Generic_error    from './pages/errors/generic'
import Home             from './pages/home'
import Sign_in          from './pages/sign in'
import Register         from './pages/register'
import Menu             from './pages/menu'
import Profile          from './pages/user/profile'
import Account          from './pages/user/account'
import Showcase         from './pages/showcase'
import Dialog_showcase  from './pages/showcase/dialog'
import Form_showcase    from './pages/showcase/form'
import Example          from './pages/example'
import Simple_example   from './pages/example/simple example'
import Database_example from './pages/example/database example'
import Log              from './pages/log'
import Simple_graphQL_example  from './pages/example/simple graphql example'

import authorization from './helpers/authorize'

const authorize = (component, is_authorized) => authorization(is_authorized)(component)

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

export default function() // (store)
{
	const routes =
	(
		<Route path="/" component={Layout} queries={Layout_queries}>
			<IndexRoute component={Home} queries={Home_queries}/>

			<Route path="example" component={Example}>
				<Route path="simple"   component={Simple_example}/>
				<Route path="database" component={Database_example}/>
				<Route path="graphql"  component={Simple_graphQL_example}/>
			</Route>

			<Route path="showcase" component={Showcase}>
				<Route path="dialog" component={Dialog_showcase}/>
				<Route path="form"   component={Form_showcase}/>
			</Route>

			{ /* Routes requiring login */ }
			<Route path="user">
				<Route path="account" component={authorize(Account)}/>
				<Route path=":id"     component={Profile}/>
			</Route>

			<Route path="logs" component={authorize(Log, 'administrator')}/>

			<Route path="sign-in"  component={Sign_in}/>
			<Route path="register" component={Register}/>

			<Route path="menu" component={Menu}/>

			<Route path="unauthenticated" status={401} component={Unauthenticated}/>
			<Route path="unauthorized"    status={403} component={Unauthorized}/>
			<Route path="error"           status={500} component={Generic_error}/>
			<Route path="*"               status={404} component={Not_found}/>
		</Route>
	)

	return routes
}