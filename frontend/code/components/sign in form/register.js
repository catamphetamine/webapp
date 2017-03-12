import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { flat as style } from 'react-styling'
import { defineMessages, FormattedMessage } from 'react-intl'
import { Form, Button } from 'react-responsive-ui'
import Redux_form from 'simpler-redux-form'

import Submit     from '../form/submit'
import Text_input from '../form/text input'

import international from '../../international/internationalize'
import { messages as user_bar_messages } from '../user bar'

import { get_language_from_locale } from '../../../../code/locale'
import { most_suitable_language as user_agreement_language } from '../../pages/legal/user agreement'
import { most_suitable_language as privacy_policy_language } from '../../pages/legal/privacy policy'

import
{
	register,
	reset_register_error,
	connector
}
from '../../redux/authentication'

@Redux_form
@connect
(
	state =>
	({
		...connector(state.authentication),
		locale : state.locale.locale
	}),
	{
		register,
		reset_register_error
	}
)
@international
export default class Register extends Component
{
	constructor()
	{
		super()

		this.register      = this.register.bind(this)
		this.validate_name = this.validate_name.bind(this)
	}

	// Reset errors on modal dismissal
	componentWillUnmount()
	{
		const
		{
			reset_register_error
		}
		= this.props

		reset_register_error()
	}

	render()
	{
		const
		{
			translate,
			register_error,
			reset_register_error,
			submit,
			submitting,
			locale
		}
		= this.props

		const markup =
		(
			<Form
				submit={ submit(reset_register_error, this.register) }
				busy={ submitting }
				error={ this.registration_error(register_error) }
				post="/users/legacy/register">

				{/* "Register" */}
				<h2 style={ styles.form_title }>
					{ translate(messages.register) }
				</h2>

				<div className="rrui__form__fields">
					{/* "Name" */}
					<Text_input
						name="name"
						validate={ this.validate_name }
						label={ translate(messages.name) }/>

					{/* Terms of service */}
					<FormattedMessage
						{ ...messages.terms_of_service }
						values={ {
							user_agreement: <a target="_blank" href={ `/${user_agreement_language(get_language_from_locale(locale))}/legal/user-agreement` }>
								{ translate(messages.user_agreement) }
							</a>,
							privacy_notice: <a target="_blank" href={ `/${privacy_policy_language(get_language_from_locale(locale))}/legal/privacy-policy` }>
								{ translate(messages.privacy_notice) }
							</a>
						} }
						tagName="p"/>
				</div>

				<Form.Error/>

				{/* Send `locale` when javascript is disabled */}
				{/* <input
					type="hidden"
					name="locale"
					value={ locale }/> */}

				{/* Support redirecting to the initial page when javascript is disabled */}
				{/* <input
					type="hidden"
					name="request"
					value={ should_redirect_to(location) }/> */}

				<Form.Actions className="rrui__form__actions--right">
					{/* "Register" button */}
					<Submit>
						{ translate(messages.register) }
					</Submit>
				</Form.Actions>
			</Form>
		)

		return markup
	}

	async register(fields)
	{
		try
		{
			const
			{
				email,
				register,
				locale,
				finish
			}
			= this.props

			await register
			({
				name : fields.name,
				email,
				locale
			})

			finish()
		}
		catch (error)
		{
			console.error(error)
			throw error
		}
	}

	registration_error(error)
	{
		const { translate } = this.props

		if (!error)
		{
			return
		}

		return translate(messages.registration_error)
	}

	validate_name(value)
	{
		const { translate } = this.props

		if (!value)
		{
			return translate(messages.registration_name_is_required)
		}
	}
}

const styles = style
`
	form_title
		margin : 0
`

export const messages = defineMessages
({
	register:
	{
		id             : 'authentication.register',
		description    : 'Registration action',
		defaultMessage : 'Register'
	},
	name:
	{
		id             : 'registration.name',
		description    : 'User name',
		defaultMessage : 'Name'
	},
	user_agreement:
	{
		id             : 'registration.user_agreement',
		description    : 'Is used in the Terms of Service text',
		defaultMessage : `User Agreement`
	},
	privacy_notice:
	{
		id             : 'registration.privacy_notice',
		description    : 'Is used in the Terms of Service text',
		defaultMessage : `Privacy Notice`
	},
	terms_of_service:
	{
		id             : 'registration.terms_of_service',
		description    : 'The text stating that the user accepts the User Agreement and Privacy Notice, and agrees with everything',
		defaultMessage : `By registering, you agree that you've read and accepted our {user_agreement}, you're at least 18 years old, and you consent to our {privacy_notice} and receiving marketing communications from us.`
	},
	registration_name_is_required:
	{
		id             : 'registration.error.name.is_required',
		description    : 'Name field value can\'t be empty',
		defaultMessage : 'Choose a user name'
	},
	registration_error:
	{
		id             : 'registration.error',
		description    : 'User registration error',
		defaultMessage : 'Couldn\'t register'
	}
})