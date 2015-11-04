import React, { Component, PropTypes } from 'react'
import { PropTypes as React_router_prop_types } from 'react-router'
import { pushState } from 'redux-router'

import { write as cookie } from '../tools/cookie'

import { connect } from 'react-redux'

import styler from 'react-styling'

import { text } from '../international components'

import Flag from './flag'
import Dropdown from './dropdown'

import { defineMessages, injectIntl as international } from 'react-intl'

import Uri from '../tools/uri'

// брать с сервера, из i18n файлов (key - имя, label - из файла этого считывать)
const locales = 
[
	{ key: 'en-US', label: 'English' },
	{ key: 'ru-RU', label: 'Русский' }
]

const messages = defineMessages
({
	language:
	{
		id             : 'application.language',
		description    : 'Web application language',
		defaultMessage : 'Language'
	},
	choose_your_language:
	{
		id             : 'application.choose_your_language',
		description    : 'Tells a user to choose a desired language',
		defaultMessage : 'Language'
	}
})

@connect
(
	store => 
	({
		locale : store.locale.locale,
		url    : store.router.location.pathname + store.router.location.search
	}),

	// Use an action creator for navigation
	{ pushState }
)
class Locale_switcher extends Component
{
	state = {}

	static propTypes =
	{
		locale: PropTypes.string.isRequired
	}

	render()
	{
		const format_message = this.props.intl.formatMessage

		const { locale } = this.props

		const markup =
		(
			<div style={{ display: 'inline-block' }}>
				{/* loading */}
				<span className="spinner" style={ this.state.setting_locale ? style.spinner.show : style.spinner.hide }></span>

				{/* dropdown list */}
				<Dropdown 
					label={format_message(messages.choose_your_language)} 
					selected={locale} 
					select={::this.set_locale} 
					list={locales.map(({ key, label }) => ({ key: key, label: label, icon: <Flag locale={key} style={style.locale.flag}/> }))} 
					style={this.props.style} 
					title={format_message(messages.language)}/>
			</div>
		)

		return markup
	}

	set_locale(locale)
	{
		this.setState({ setting_locale: true })

		cookie('locale', locale)
		window.location.reload()
		// window.location = new Uri(this.props.url).parameter('locale', locale).print()
	}
}

export default international(Locale_switcher)

const style = styler
`
	spinner
		transition       : opacity 500ms ease-out
		transition-delay : 150ms
		margin-bottom    : 0.06em

		&show
			opacity : 1
		&hide
			opacity : 0

	locale
		flag
			margin-right   : 0.4em
			margin-bottom  : 0.2em
			vertical-align : bottom
`