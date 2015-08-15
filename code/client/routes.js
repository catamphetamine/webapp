import React from 'react'
import { Router, Route } from 'react-router'

import Layout    from './pages/layout.js'
import Editor    from './pages/editor.js'
import About     from './pages/about.js'
import Home      from './pages/home.js'
import Showcase  from './pages/showcase.js'
import Not_found from './pages/not found.js'
import Dialog    from './pages/showcase/dialog.js'
import Form      from './pages/showcase/form.js'

export default function(store)
{
	const routes =
	(
		<Route component={Layout}>
			<Route path="/" component={Home} />
			<Route path="/editor" component={Editor} />
			<Route path="/about" component={About} />
			<Route path="/showcase" component={Showcase}>
				<Route path="/dialog" component={Dialog} />
				<Route path="/form" component={Form} />
			</Route>
			<Route path="*" component={Not_found}/>
		</Route>
	)

			// <Route component={Require_login} onEnter={Require_login.on_enter(store)}>
			// 	<Route path="/login_success" component={Login_success}/>
			// </Route>

	return routes
}