import React            from 'react'
import { Provider }     from 'react-redux'
import { IntlProvider } from 'react-intl'

export default function markup_wrapper(component, { store, locale, messages })
{
	// all React "prop"erty providers go here.
	// e.g. redux Provider, react-intl IntlProvider.

	const markup = 
	(
		<Provider store={store} key="provider">
			<IntlProvider locale={locale ? get_language_from_locale(locale) : 'en'} messages={messages}>
				{component}
			</IntlProvider>
		</Provider>
	)

	return markup
}