/* global _devtools_ */
import React          from 'react'
import router         from './router'
import BrowserHistory from 'react-router/lib/BrowserHistory'
import Location       from 'react-router/lib/Location'

import language       from './scripts/libraries/language.js'

import create_store   from './flux/redux/create'
import api_client     from './api client'

React.initializeTouchEvents(true)

import styling from './styles/style.scss'

const history = new BrowserHistory()
const client = new api_client()

const content_container = document.getElementById('content')
const store = create_store(client, window._flux_store_data)
const location = new Location(document.location.pathname, document.location.search)

router(location, history, store)
	.then(({component}) =>
	{
		if (_devtools_)
		{
			const { DevTools, DebugPanel, LogMonitor } = require('redux-devtools/lib/react')

			console.info('You will see a "Warning: React attempted to reuse markup in a container but the checksum was' +
				' invalid." message. That\'s because the redux-devtools are enabled.')

			React.render(
			<div>
				{component}
				<DebugPanel top right bottom key="debugPanel">
					<DevTools store={store} monitor={LogMonitor}/>
				</DebugPanel>
			</div>,
			content_container)
		}
		else
		{
			React.render(component, content_container)
		}
	},
	(error) =>
	{
		console.error(error)
	})

if (_development_)
{
	window.React = React // enable debugger
	const reactRoot = window.document.getElementById('content')

	if (!reactRoot || !reactRoot.firstChild || !reactRoot.firstChild.attributes || !reactRoot.firstChild.attributes['data-react-checksum'])
	{
		console.error('Server-side React render was discarded. Make sure that your initial render does not contain any client-side code.')
	}
}