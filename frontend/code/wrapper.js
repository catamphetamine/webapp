import React, { Component, PropTypes } from 'react'
import { Provider }                    from 'react-redux'
import { IntlProvider }                from 'react-intl'
import { AppContainer }                from 'react-hot-loader'

import { get_language_from_locale } from '../../code/locale'

function Wrapper(props)
{
	// all React "prop"erty providers go here.
	// e.g. redux Provider, react-intl IntlProvider.

	const { store, locale, messages, children } = props

	const markup =
	(
		<AppContainer>
			<Provider store={store}>
				<IntlProvider locale={locale ? get_language_from_locale(locale) : 'en'} messages={messages}>
					{children}
				</IntlProvider>
			</Provider>
		</AppContainer>
	)

	return markup
}

Wrapper.propTypes =
{
	store     : React.PropTypes.object.isRequired,
	locale    : React.PropTypes.string.isRequired,
	messages  : React.PropTypes.object.isRequired
}

export default Wrapper