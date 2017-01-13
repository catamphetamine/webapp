// The polyfill will emulate a full ES6 environment (for old browsers)
// (including generators, which means async/await)
import 'babel-polyfill'

import React      from 'react'
import { render } from 'react-isomorphic-render'
import inject_tap_event_plugin from 'react-tap-event-plugin'

import language from '../../code/language'
import settings from './react-isomorphic-render'
import international from './international/loader'

// include these assets in webpack build (styles, images)

import html_assets from './html assets'

for (let asset of Object.keys(html_assets))
{
	html_assets[asset]()
}

// Needed for onTouchTap
// Can go away when react 1.0 release
// Check this repo:
// https://github.com/zilverline/react-tap-event-plugin
inject_tap_event_plugin()

// load the Intl polyfill and its locale data before rendering the application
international.load().then(() =>
{
	// renders the webpage on the client side
	return render(settings,
	{
		// enable/disable Redux dev-tools (true/false)
		devtools: _development_tools_ && require('./devtools').default,

		// internationalization
		// (this is here solely for Webpack HMR in dev mode)
		translation: process.env.NODE_ENV !== 'production' && international.load_translation
	})
	.then(({ store, rerender }) =>
	{
		if (module.hot)
		{
			module.hot.accept('./react-isomorphic-render', () =>
			{
				store.hotReload(settings.reducer)
				rerender()
			})

			international.hot_reload(rerender)
		}
	})
})