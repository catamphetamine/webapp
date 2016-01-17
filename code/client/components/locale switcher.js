import React, { Component, PropTypes } from 'react'
import { PropTypes as React_router_prop_types } from 'react-router'
import { pushState } from 'redux-router'

import { write as cookie } from '../tools/cookie'

import { connect } from 'react-redux'

import styler from 'react-styling'

import Flag     from './flag'
import Dropdown from './dropdown'
import Spinner  from './spinner'

import { defineMessages } from 'react-intl'
import international from '../internationalize'

import Uri from '../tools/uri'

// брать с сервера, из i18n файлов (key - имя, label - из файла этого считывать)
const locales = 
[
	{ value: 'en-US', label: 'English' },
	{ value: 'ru-RU', label: 'Русский' },
	// { key: 'test',  label: 'Test Long list' },
	// { key: 'test2',  label: 'Test Long list' },
	// { key: 'test3',  label: 'Test Long list' },
	// { key: 'test4',  label: 'Test Long list' },
	// { key: 'test5',  label: 'Test Long list' },
	// { key: 'test6',  label: 'Test Long list' }
]

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
		locale : store.locale.locale,
		// url    : store.router.location.pathname + store.router.location.search
	}),

	// Use an action creator for navigation
	{ pushState }
)
@international()
export default class Locale_switcher extends Component
{
	state = {}

	static propTypes =
	{
		locale: PropTypes.string.isRequired
	}

	render()
	{
		const translate = this.props.intl.formatMessage

		const { locale } = this.props

		const markup =
		(
			<div className="language" style={ this.props.style ? extend({ display: 'inline-block' }, this.props.style) : { display: 'inline-block' } }>
				{/* loading */}
				<Spinner style={ this.state.setting_locale ? style.spinner.show : style.spinner.hide }/>

				{/* dropdown list */}
				<Dropdown 
					label={translate(messages.language)} 
					value={locale} 
					on_change={::this.set_locale} 
					options={locales.map(({ value, label }) => ({ value, label, icon: <Flag locale={value} style={style.locale.flag}/> }))} 
					title={translate(messages.language)}
					upward={this.props.upward}/>
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

const style = styler
`
	spinner
		width  : 1em
		height : 1em

		margin-bottom    : 0.45em

		transition       : opacity 500ms ease-out
		transition-delay : 150ms

		&show
			opacity : 1
		&hide
			opacity : 0

	locale
		flag
			margin-right   : 0.4em
			margin-bottom  : -0.03em
			vertical-align : baseline
`