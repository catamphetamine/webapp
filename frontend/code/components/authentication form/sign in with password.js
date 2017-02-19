import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { flat as style } from 'react-styling'
import { defineMessages, FormattedMessage } from 'react-intl'
import { Form, Button } from 'react-responsive-ui'
import Redux_form from 'simpler-redux-form'

import { login_attempts_limit_exceeded_error } from './sign in'
import { messages as user_bar_messages } from '../user bar'
import http_status_codes from '../../tools/http status codes'

import Submit     from '../form/submit'
import Text_input from '../form/text input'

import international from '../../international/internationalize'
import { messages as sign_in_messages } from './sign in'

import
{
	sign_in_with_password,
	reset_sign_in_with_password_error,
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
		sign_in_with_password,
		reset_sign_in_with_password_error
	}
)
@international
export default class Sign_in_with_password extends Component
{
	constructor()
	{
		super()

		this.sign_in_with_password  = this.sign_in_with_password.bind(this)
		this.validate_password      = this.validate_password.bind(this)
	}

	// Reset errors on modal dismissal
	componentWillUnmount()
	{
		const
		{
			reset_sign_in_with_password_error
		}
		= this.props

		reset_sign_in_with_password_error()
	}

	render()
	{
		const
		{
			translate,
			sign_in_with_password_error,
			reset_sign_in_with_password_error,
			submit,
			submitting
		}
		= this.props

		const markup =
		(
			<Form
				className="authentication-form authentication-form-password"
				action={ submit(reset_sign_in_with_password_error, this.sign_in_with_password) }
				busy={ submitting }
				error={ this.sign_in_with_password_error(sign_in_with_password_error) }
				post="/authentication/legacy/sign-in">

				{/* "Sign in" */}
				<h2 style={ styles.form_title }>
					{ translate(user_bar_messages.sign_in) }
				</h2>

				<div className="rrui__form__fields">
					{/* "Password" */}
					<Text_input
						password
						name="password"
						error={ this.password_error(sign_in_with_password_error) }
						validate={ this.validate_password }
						label={ translate(messages.password) }/>
				</div>

				<Form.Error/>

				<Form.Actions className="rrui__form__actions--right">
					{/* "Sign in" button */}
					<Submit>
						{ translate(user_bar_messages.sign_in) }
					</Submit>
				</Form.Actions>
			</Form>
		)

		return markup
	}

	async sign_in_with_password(fields)
	{
		try
		{
			const
			{
				authentication,
				sign_in_with_password
			}
			= this.props

			await sign_in_with_password
			({
				id       : authentication.id,
				password : fields.password
			})
		}
		catch (error)
		{
			console.error(error)
		}
	}

	sign_in_with_password_error(error)
	{
		const { translate, locale } = this.props

		if (!error)
		{
			return
		}

		if (error.field === 'password')
		{
			return
		}

		if (error.message === 'Password attempts limit exceeded' ||
			error.message === 'Access code attempts limit exceeded')
		{
			return login_attempts_limit_exceeded_error(error)
		}

		return translate(sign_in_messages.sign_in_error)
	}

	password_error(error)
	{
		const { translate } = this.props

		if (!error)
		{
			return
		}

		if (error.field !== 'password')
		{
			return
		}

		if (error.status === http_status_codes.Input_rejected)
		{
			return translate(messages.wrong_password)
		}
	}

	validate_password(value)
	{
		const { translate } = this.props

		if (!value)
		{
			return translate(messages.password_is_required)
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
	password:
	{
		id             : 'authentication.password',
		description    : 'Password',
		defaultMessage : 'Password'
	},
	password_is_required:
	{
		id             : 'authentication.error.password.is_required',
		description    : `Password field value can't be empty`,
		defaultMessage : `Enter the password`
	},
	wrong_password:
	{
		id             : 'authentication.error.password.mismatch',
		description    : `The password doesn't match`,
		defaultMessage : 'Wrong password'
	}
})