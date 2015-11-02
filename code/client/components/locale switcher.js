import React, { Component, PropTypes } from 'react'
import { PropTypes as React_router_prop_types } from 'react-router'

import { write as cookie } from '../tools/cookie'

import { connect } from 'react-redux'

import styler from 'react-styling'

import { text } from '../international components'

import Flag from './flag'
import Dropdown from './dropdown'

import { defineMessages, injectIntl as international } from 'react-intl'

import Uri from '../tools/uri'

const locales = ['en-US', 'ru-RU']

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
		defaultMessage : 'Choose your language'
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

		const { locale } = this.props

		const markup =
		(
			<div className="LocaleSwitcher" style={this.props.style}>
				<span style={style.label}>{format_message(messages.language)}</span>

				<Dropdown selected={locale} select={::this.set_locale} list={locales.map(locale => ({ key: locale, value: locale, icon: <Flag locale={locale} style={style.locale.flag}/> }))} style={style.locales}/>
			</div>
		)

		return markup
	}

	set_locale(locale)
	{
		cookie('locale', locale)
		window.location = new Uri(this.context.location.pathname + this.context.location.search).parameter('locale', locale).print()
	}
}

export default international(Locale_switcher)

const style = styler
`
	label
		margin-right : 0.6em

	locales
		display : inline-block

	locale
		flag
			margin-right   : 0.4em
			margin-bottom  : 0.2em
			vertical-align : bottom
`