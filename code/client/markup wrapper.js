import React, { Component, PropTypes } from 'react'
import { Provider }                    from 'react-redux'
import { IntlProvider }                from 'react-intl'

function Wrapper(props)
{
	// all React "prop"erty providers go here.
	// e.g. redux Provider, react-intl IntlProvider.

	const { store, locale, messages } = props

	const markup = 
	(
		<Provider store={store} key="provider">
			<IntlProvider locale={locale ? get_language_from_locale(locale) : 'en'} messages={messages}>
				{props.children}
			</IntlProvider>
		</Provider>
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