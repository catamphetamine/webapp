import React from 'react'

import Layout from './pages/layout.js'

import Editor from './pages/editor.js'
import About from './pages/about.js'
import Home from './pages/home.js'

import Showcase from './pages/showcase.js'
import Not_found from './pages/not found.js'

// import Dialog from './pages/showcase/dialog.js'

import Form from './pages/showcase/form.js'

import { Router, Route, DefaultRoute } from 'react-router'

// import BrowserHistory from 'react-router/lib/BrowserHistory'
// import HashHistory from 'react-router/lib/HashHistory'

/**
 * The React Routes for both the server and the client.
 *
 * @class Routes
 */

// <Route path="/dialog" component={Dialog} />

export default 
(
	<Route component={Layout}>
		<Route path="/" component={Home} />
		<Route path="/editor" component={Editor} />
		<Route path="/about" component={About} />
		<Route path="/showcase" component={Showcase}>
			<Route path="/form" component={Form} />
		</Route>
		<Route path="*" component={Not_found}/>
	</Route>
)