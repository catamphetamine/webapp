import React, { Component, PropTypes } from 'react'
import { PropTypes as React_router_prop_types } from 'react-router'

const locales = ['en-US', 'ru-RU']

import { write as cookie } from '../cookie'

import { connect } from 'react-redux'

import styler from 'react-styling'

import { text } from '../international components'

import { defineMessages, injectIntl as international } from 'react-intl'

import Uri from '../libraries/uri'

const messages = defineMessages
({
	language:
	{
		id             : 'application.language',
		description    : 'Web application language',
		defaultMessage : 'Language'
	}
})

@connect
(
	store => 
	({
		locale : store.locale.locale
	})
)
class Locale_switcher extends Component
{
	static propTypes =
	{
		locale: PropTypes.string.isRequired
	}

	static contextTypes =
	{
		location: React_router_prop_types.location
	}

	render()
	{
		const format_message = this.props.intl.formatMessage

		const markup =
		(
			<div className="LocaleSwitcher" style={this.props.style}>
				{format_message(messages.language)}

				<ul style={style.locales}>
					{locales.map(this.render_locale_link.bind(this))}
				</ul>
			</div>
		)

		return markup
	}

	render_locale_link(locale)
	{
		const current_locale = this.props.locale

		const markup = 
		(
			<li key={locale} style={locale === current_locale ? style.locale.current : style.locale}>
				<a
					style={locale === current_locale ? style.locale.current.link : style.locale.link}
					onClick={this.handle_locale_click.bind(this, locale)}
					href={new Uri(this.context.location.pathname + this.context.location.search).parameter('locale', locale).print()}>

					<img src=""/>
					{ locale }
				</a>
			</li>
		)

		return markup
	}

	handle_locale_click(locale, event)
	{
		event.preventDefault()
		cookie('locale', locale, 365)
		window.location.reload()
	}
}

export default international(Locale_switcher)

const style = styler
`
	locales
		display         : inline-block
		list-style-type : none
		padding         : 0
		margin-left     : 0.5em

	locale
		display        : inline-block

		padding-left   : 0.3em
		padding-right  : 0.3em

		padding-top    : 0.1em
		padding-bottom : 0.1em

		link
			text-decoration : none
			color           : black

		&current
			background : black

			link
				color           : white
`