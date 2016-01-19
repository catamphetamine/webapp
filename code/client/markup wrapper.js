import React, { Component, PropTypes } from 'react'
import { Provider }                    from 'react-redux'
import { IntlProvider }                from 'react-intl'

export default class Wrapper extends Component
{
	static propTypes = 
	{
		store     : React.PropTypes.object.isRequired,
		locale    : React.PropTypes.string.isRequired,
		messages  : React.PropTypes.object.isRequired
	}

	// all React "prop"erty providers go here.
	// e.g. redux Provider, react-intl IntlProvider.
	//
	render()
	{
		const { store, locale, messages } = this.props

		const markup = 
		(
			<Provider store={store} key="provider">
				<IntlProvider locale={locale ? get_language_from_locale(locale) : 'en'} messages={messages}>
					{this.props.children}
				</IntlProvider>
			</Provider>
		)

		return markup
	}
}