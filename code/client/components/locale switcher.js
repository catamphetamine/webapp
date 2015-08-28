import React, { Component, PropTypes } from 'react'

// const locales = ['en_US', 'ru_RU']
const locales = ['en', 'ru']

import { write as cookie } from '../cookie'

import { connect } from 'react-redux'

import styler from 'react-styling'

import { FormattedMessage } from '../international components'

@connect
(
	store => 
	({
		locale : store.locale.locale
	})
)
export default class Locale_switcher extends Component
{
	static propTypes =
	{
		locale: PropTypes.string.isRequired
	}

	render()
	{
		const markup =
		(
			<div className="LocaleSwitcher" style={this.props.style}>
				<FormattedMessage message="home.language" />

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
					href={`?locale=${locale}`}>
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