import React from 'react'

import Html         from './../client/html'
import api_client   from './../client/api client'

import log from './log'

import { server }     from '../react-isomorphic-render'
import create_store   from '../client/redux/store'
import routes         from '../client/routes'

// isomorphic (universal) rendering (express middleware).
// will be used in express_application.use(...)
export function render(request, response)
{
	if (_development_)
	{
		webpack_isomorphic_tools.refresh()
	}

	server
	({
		disable_server_side_rendering : _disable_server_side_rendering_,
		routes   : routes,
		store    : create_store(new api_client(request)),
		request  : request,
		response : response,
		html:
		{
			with_rendering: (component, store) => <Html assets={webpack_isomorphic_tools.assets()} component={component} store={store}/>,
			without_rendering: (store) => <Html assets={webpack_isomorphic_tools.assets()} component={<div/>} store={store}/>
		}
	})
	.catch((error) =>
	{
		if (error.redirect)
		{
			response.redirect(error.redirect)
			return
		}
		log.error(error)
		response.status(500).send({error: error})
	})
}