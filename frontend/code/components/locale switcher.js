import React, { Component, PropTypes } from 'react'

// import { write as cookie } from '../tools/cookie'

import { connect } from 'react-redux'

import styler from 'react-styling'

import Flag     from './flag'

import { Form, Button, ActivityIndicator, Select } from 'react-responsive-ui'

import Url from '../../../code/url'

import { defineMessages } from 'react-intl'
import international from '../international/internationalize'

// брать с сервера, из i18n файлов (key - имя, label - из файла этого считывать)
const locales =
[
	{ value: 'en', label: 'English' },
	{ value: 'ru', label: 'Русский' },
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
	},
	apply:
	{
		id             : 'application.set_language',
		description    : 'Web application language selection box apply button text',
		defaultMessage : '✓'
	}
})

@connect
(
	model =>
	({
		locale   : model.locale.locale,
		location : model.router.location
	})
)
@international()
export default class Locale_switcher extends Component
{
	state = {}

	static propTypes =
	{
		locale: PropTypes.string.isRequired
	}

	constructor(props, context)
	{
		super(props, context)

		this.set_locale = this.set_locale.bind(this)
	}

	render()
	{
		const { locale, translate, upward, alignment, location } = this.props

		const markup =
		(
			<div className="language" style={ this.props.style ? extend({ display: 'inline-block' }, this.props.style) : { display: 'inline-block' } }>
				{/* loading */}
				<ActivityIndicator style={ this.state.setting_locale ? style.spinner.show : style.spinner.hide }/>

				{/* Apply button for javascriptless users */}
				<Form
					className="set-language-form"
					style={style.locale.form}
					post="/users/legacy/locale">

					{/* language list */}
					<Select
						name="locale"
						label={translate(messages.language)}
						value={locale}
						onChange={this.set_locale}
						title={translate(messages.language)}
						alignment={alignment}
						upward={upward}>

						{locales.map(({ value, label }) =>
						{
							const markup =
							(
								<div key={value} value={value} label={label} style={style.item}>
									<Flag locale={value} style={style.locale.flag}/>
									{label}
								</div>
							)

							return markup
						})}
					</Select>

					{/* submit */}
					<Button
						className="rrui__rich__fallback"
						style={style.locale.form.button}
						submit={true}>

						{translate(messages.apply)}
					</Button>

					{/* this page url for back redirection */}
					<input
						type="hidden"
						name="from_url"
						value={new Url(location).to_relative_url()}/>
				</Form>
			</div>
		)

		return markup
	}

	set_locale(locale)
	{
		this.setState({ setting_locale: true })

		// a hacky way of doing it

		const form = document.querySelector('.set-language-form')

		const select = form.querySelector('select')
		select.removeAttribute('name')

		const locale_value = document.createElement('input')
		locale_value.setAttribute('name', 'locale')
		locale_value.setAttribute('type', 'hidden')
		locale_value.setAttribute('value', locale)

		form.appendChild(locale_value)

		form.submit()
	}
}

const style = styler
`
	spinner
		display : inline-block

		width  : 1em
		height : 1em

		margin-bottom    : 0.2em
		margin-right     : 0.2em

		transition       : opacity 500ms ease-out
		transition-delay : 150ms

		&show
			opacity : 1
		&hide
			opacity : 0

	locale
		flag
			position       : relative
			top            : 0.05em
			width          : 1.2em
			margin-right   : 0.4em
			vertical-align : baseline

		form
			display : inline-block
			vertical-align : bottom

			button
				margin-left   : 0.5em
				margin-bottom : 0.2em

	item
		cursor : default
`