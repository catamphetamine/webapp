import React            from 'react'
import { Provider }     from 'react-redux'
import { IntlProvider } from 'react-intl'

export default function markup_wrapper(component, { store, locale, messages })
{
	const markup = 
	(
		<Provider store={store} key="provider">
			<IntlProvider locale={get_language_from_locale(locale)} messages={messages}>
				{component}
			</IntlProvider>
		</Provider>
	)

	return markup
}