import React    from 'react'
import Router   from 'react-router'
import Location from 'react-router/lib/Location'

import Html         from './../client/html'
import api_client   from './../client/api client'
import router       from './../client/router'
import create_store from './../client/redux/store'

import * as webpack from './webpack'
import log from './log'

// серверный ("изоморфный") рендеринг
export function render(request, response)
{
	const client = new api_client(request)
	const store = create_store(client)
	const location = new Location(request.path, request.query)

	if (_disable_server_side_rendering_)
	{
		return response.send('<!doctype html>\n' +
			React.renderToString(<Html webpackStats={webpack.stats()} component={<div/>} store={store}/>))
	}

	router(location, undefined, store)
	.then(({component, transition, redirect}) =>
	{
		try
		{
			if (redirect)
			{
				return response.redirect(transition.redirectInfo.pathname)
			}

			response.send('<!doctype html>\n' +
				React.renderToString(<Html webpackStats={webpack.stats()} component={component} store={store}/>))
		}
		catch (error)
		{
			log.error(error)
			response.status(500).send({error: error})
		}
	},
	(error) =>
	{
		log.error(error)
		response.status(500).send({error: error})
	})
}