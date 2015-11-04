import React from 'react'

import Html         from '../client/html'
import api_client   from '../client/api client'

import { server }     from '../react-isomorphic-render'
import create_store   from '../client/redux/store'
import routes         from '../client/routes'
import markup_wrapper from '../client/markup wrapper'

import load_locale_data from './locale'

// isomorphic (universal) rendering (express middleware).
// will be used in express_application.use(...)
export function render({ request, respond, fail, redirect, preferred_locale })
{
	if (_development_)
	{
		webpack_isomorphic_tools.refresh()
	}

	const store = create_store(new api_client(request))

	let { locale, messages } = load_locale_data(preferred_locale)

	store.dispatch({ type: 'locale set', locale: locale })
	// store.dispatch({ type: 'locale data loaded', data: { language: locale, messages: locale_data } })

	return server
	({
		disable_server_side_rendering : _disable_server_side_rendering_,
		// routes   : () => routes({ store }),
		// preload  : preloader => preloader(store),
		wrap_component: component =>
		{
			return markup_wrapper(component, { store, locale, messages })
		},
		url: request.originalUrl.replace(/\?$/, ''),
		html:
		{
			with_rendering: component => <Html locale={locale} messages={messages} assets={webpack_isomorphic_tools.assets()} component={component} store={store}/>,
			without_rendering: () => <Html locale={locale} messages={messages} assets={webpack_isomorphic_tools.assets()} store={store}/>
		},
		store: store
	})
	.then(({ status, markup, redirect_to }) =>
	{
		if (redirect_to)
		{
			return redirect(redirect_to)
		}

		respond({ status, markup })
	},
	error =>
	{
		// if (error.redirect)
		// {
		// 	return redirect(error.redirect)
		// }

		log.error(error)
		fail(error)

		if (error.markup)
		{
			respond({ markup: error.markup })
		}
	})
}