import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { flat as style } from 'react-styling'
import { defineMessages, FormattedMessage } from 'react-intl'
import { Form, Button } from 'react-responsive-ui'
import Redux_form from 'simpler-redux-form'
import classNames from 'classnames'

import { authentication_attempts_limit_exceeded_error } from './authentication form'
import http_status_codes from '../../tools/http status codes'

import Submit     from '../form/submit'
import Text_input from '../form/text input'

import international from '../../international/internationalize'

import
{
	authenticate,
	reset_authenticate_error,
	connector
}
from '../../redux/authentication'

@Redux_form
@connect
(
	state =>
	({
		...connector(state.authentication)
	}),
	{
		authenticate,
		reset_authenticate_error
	}
)
@international
export default class Authenticate_with_password extends Component
{
	constructor()
	{
		super()

		this.authenticate = this.authenticate.bind(this)
	}

	// Reset errors on modal dismissal
	componentWillUnmount()
	{
		const
		{
			reset_authenticate_error
		}
		= this.props

		reset_authenticate_error()
	}

	render()
	{
		const
		{
			translate,
			authenticate_error,
			reset_authenticate_error,
			submit,
			submitText,
			title,
			submitting,
			className
		}
		= this.props

		const markup =
		(
			<Form
				action={ submit(reset_authenticate_error, this.authenticate) }
				busy={ submitting }
				error={ this.authenticate_error(authenticate_error) }
				post="/authentication/legacy/sign-in">

				{/* "Sign in" */}
				<h2 style={ styles.form_title }>
					{ title }
				</h2>

				<div className="rrui__form__fields">
					{/* "Password" */}
					<Text_input
						password
						name="password"
						error={ this.password_error(authenticate_error) }
						validate={ this.validate_password }
						label={ translate(messages.password) }/>
				</div>

				<Form.Error/>

				<Form.Actions className="rrui__form__actions--right">
					{/* "Sign in" button */}
					<Submit>
						{ submitText }
					</Submit>
				</Form.Actions>
			</Form>
		)

		return markup
	}

	async authenticate(fields)
	{
		try
		{
			const
			{
				authentication,
				authenticate,
				finished
			}
			= this.props

			const result = await authenticate
			({
				multifactor_authentication_id : authentication.id,
				id    : authentication.pending.find_by({ type: 'password' }).id,
				value : fields.password
			})

			if (!result)
			{
				finished()
			}
		}
		catch (error)
		{
			console.error(error)
		}
	}

	authenticate_error(error)
	{
		const { translate, locale } = this.props

		if (!error)
		{
			return
		}

		if (this.password_error(error))
		{
			return
		}

		if (error.message === 'Authentication attempts limit exceeded')
		{
			return authentication_attempts_limit_exceeded_error(error)
		}

		return translate(messages.error)
	}

	password_error(error)
	{
		const { translate } = this.props

		if (!error)
		{
			return
		}

		if (error.status === http_status_codes.Input_rejected)
		{
			return translate(messages.wrong_password)
		}
	}

	validate_password = (value) =>
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
	error:
	{
		id             : 'authentication.access_code.error',
		description    : 'A generic authentication failed message',
		defaultMessage : `Couldn't authenticate with access code`
	},
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