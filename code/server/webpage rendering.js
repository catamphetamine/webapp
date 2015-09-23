import React from 'react'

import Html         from './../client/html'
import api_client   from './../client/api client'

import log from './log'

import { server }     from '../react-isomorphic-render'
import create_store   from '../client/redux/store'
import routes         from '../client/routes'

// isomorphic (universal) rendering (express middleware).
// will be used in express_application.use(...)
export function render({ request, respond, fail, redirect, locale })
{
	if (_development_)
	{
		webpack_isomorphic_tools.refresh()
	}

	const store = create_store(new api_client(request))

	const locale_data = require(`../client/international/${locale}`)

	store.dispatch({ type: 'locale data loaded', data: locale_data })

	return server
	({
		disable_server_side_rendering : _disable_server_side_rendering_,
		routes   : routes,
		store    : store,
		request  : request,
		html:
		{
			with_rendering: (component, store) => <Html assets={webpack_isomorphic_tools.assets()} component={component} store={store}/>,
			without_rendering: (store) => <Html assets={webpack_isomorphic_tools.assets()} component={<div/>} store={store}/>
		}
	})
	.then(({ markup, redirect_to }) =>
	{
		if (redirect_to)
		{
			return redirect(redirect_to)
		}

		respond(markup)
	},
	error =>
	{
		if (error.redirect)
		{
			return redirect(error.redirect)
		}

		log.error(error)
		fail(error)

		if (error.markup)
		{
			respond(error.markup)
		}
	})
}