import React, { Component, PropTypes } from 'react'
import { withRouter } from 'react-router'
import { connect } from 'react-redux'
import { flat as style } from 'react-styling'
import { Form, Button, ActivityIndicator, Select } from 'react-responsive-ui'
import { defineMessages } from 'react-intl'

import Flag from './flag'
import Url from '../../../code/url'
import international from '../international/internationalize'
import { set_locale } from '../redux/locale'

// брать с сервера, из i18n файлов (key - имя, label - из файла этого считывать)
const locales =
[
	{ value: 'en', label: 'English' },
	{ value: 'ru', label: 'Русский' }
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

@connect(state => ({ locale : state.locale.locale }), { set_locale })
@international
@withRouter
export default class Locale_switcher extends Component
{
	state = {}

	static propTypes =
	{
		locale: PropTypes.string.isRequired,
		router: PropTypes.object.isRequired
	}

	constructor(props, context)
	{
		super(props, context)

		this.set_locale = this.set_locale.bind(this)
	}

	render()
	{
		const
		{
			locale,
			translate,
			upward,
			alignment,
			router: { location }
		}
		= this.props

		const { setting_locale } = this.state

		const markup =
		(
			<div className="language" style={ this.props.style ? extend(styles.container, this.props.style) : styles.container }>
				{/* loading */}
				<ActivityIndicator style={ setting_locale ? styles.spinner_show : styles.spinner_hide }/>

				{/* Apply button for javascriptless users */}
				<Form
					className="set-language-form"
					style={ styles.locale_form }
					post="/users/legacy/locale">

					{/* language list */}
					<Select
						name="locale"
						disabled={setting_locale}
						placeholder={translate(messages.language)}
						value={locale}
						onChange={this.set_locale}
						title={translate(messages.language)}
						alignment={alignment}
						upward={upward}>

						{locales.map(({ value, label }) =>
						{
							const markup =
							(
								<div key={value} value={value} label={label}>
									<Flag locale={value} style={styles.locale_flag}/>
									{label}
								</div>
							)

							return markup
						})}
					</Select>

					{/* (legacy) javascriptless submit */}
					{/*
					<Button
						className="rrui__rich__fallback"
						style={styles.locale_form_button}
						submit={true}>

						{translate(messages.apply)}
					</Button>
					*/}

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

	async set_locale(locale)
	{
		const { set_locale } = this.props

		this.setState({ setting_locale: true })

		try
		{
			await set_locale(locale)
			window.location.reload()
		}
		finally
		{
			this.setState({ setting_locale: true })
		}

		// // a hacky way of doing it

		// const form = document.querySelector('.set-language-form')

		// // const select = form.querySelector('select')
		// // select.removeAttribute('name')

		// const locale_value = document.createElement('input')
		// locale_value.setAttribute('name', 'locale')
		// locale_value.setAttribute('type', 'hidden')
		// locale_value.setAttribute('value', locale)

		// form.appendChild(locale_value)

		// form.submit()
	}
}

const styles = style
`
	container
		display     : flex
		align-items : center

	spinner
		display : inline-block

		width  : 1em
		height : 1em

		margin-right     : 0.3em

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

			// button
			// 	margin-left   : 0.5em
			// 	margin-bottom : 0.2em
`