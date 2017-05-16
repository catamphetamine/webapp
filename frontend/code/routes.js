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
if (process.env.NODE_ENV !== 'production')
{
	const console_error = console.error
	console.error = (...parameters) =>
	{
		if (typeof parameters[0] !== 'string' || !parameters[0].starts_with('[React Intl] Missing message:'))
		{
			console_error.call(console, ...parameters)
		}
	}
}

import React from 'react'
import { Router, Route, IndexRoute } from 'react-router'

import Layout           from './pages/layout'
import Not_found        from './pages/errors/not found'
import Unauthenticated  from './pages/errors/unauthenticated'
import Unauthorized     from './pages/errors/unauthorized'
import Generic_error    from './pages/errors/generic'
import Home             from './pages/home'
import Sign_in          from './pages/sign in'
import Menu             from './pages/menu'
import Block_user       from './pages/poster/block'
import Profile          from './pages/poster/profile/profile'
import Posts            from './pages/poster/profile/posts/posts'
import Settings         from './pages/user/settings'
import Log              from './pages/log'
import User_agreement   from './pages/legal/user agreement'
import Privacy_policy   from './pages/legal/privacy policy'

const routes =
(
	<Route path="/" component={ Layout }>
		<IndexRoute component={ Home }/>

		<Route path="settings" component={ Settings }/>
		<Route path="logs" component={ Log }/>
		<Route path="sign-in" component={ Sign_in }/>
		<Route path="menu" component={ Menu }/>

		<Route path=":language/legal/user-agreement" component={ User_agreement }/>
		<Route path=":language/legal/privacy-policy" component={ Privacy_policy }/>

		<Route path="unauthenticated" status={ 401 } component={ Unauthenticated }/>
		<Route path="unauthorized"    status={ 403 } component={ Unauthorized }/>
		<Route path="error"           status={ 500 } component={ Generic_error }/>
		<Route path="not-found"       status={ 404 } component={ Not_found }/>

		<Route path=":poster_id/block/:token_id" component={ Block_user }/>

		<Route path=":id" component={ Profile }>
			<IndexRoute component={ Posts } fullWidth={ false }/>
			<Route path="subscriptions" component={ Posts } fullWidth={ true }/>
			<Route path="photos" component={ Posts } fullWidth={ true }/>
			<Route path="videos" component={ Posts } fullWidth={ true }/>
		</Route>
	</Route>
)

export default routes