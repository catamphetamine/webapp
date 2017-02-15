import React, { Component, PropTypes } from 'react'
import { withRouter } from 'react-router'
import { connect } from 'react-redux'
import { flat as style } from 'react-styling'
import { defineMessages, FormattedMessage } from 'react-intl'
import { Form, Button } from 'react-responsive-ui'
import { redirect } from 'react-isomorphic-render'
import Redux_form from 'simpler-redux-form'

import { should_redirect_to } from '../../helpers/redirection'
import { preload_started } from '../../redux/preload'
import { messages as user_bar_messages } from '../user bar'
import http_status_codes from '../../tools/http status codes'

import Submit     from '../form/submit'
import Text_input from '../form/text input'

import international from '../../international/internationalize'
import { messages as sign_in_messages } from './sign in'

import
{
	sign_in_with_access_code,
	reset_sign_in_with_access_code_error,
	connector
}
from '../../redux/authentication'

@withRouter
@Redux_form
@connect
(
	state =>
	({
		...connector(state.authentication)
	}),
	{
		sign_in_with_access_code,
		reset_sign_in_with_access_code_error,
		preload_started
	}
)
@international
export default class Sign_in_with_access_code extends Component
{
	constructor()
	{
		super()

		this.sign_in_with_access_code  = this.sign_in_with_access_code.bind(this)
		this.validate_access_code      = this.validate_access_code.bind(this)
	}

	// Reset errors on modal dismissal
	componentWillUnmount()
	{
		const
		{
			reset_sign_in_with_access_code_error
		}
		= this.props

		reset_sign_in_with_access_code_error()
	}

	render()
	{
		const
		{
			translate,
			sign_in_with_access_code_error,
			reset_sign_in_with_access_code_error,
			submit,
			submitting
		}
		= this.props

		const markup =
		(
			<Form
				className="authentication-form authentication-form-access-code"
				action={ submit(reset_sign_in_with_access_code_error, this.sign_in_with_access_code) }
				busy={ submitting }
				error={ this.sign_in_with_access_code_error(sign_in_with_access_code_error) }
				post="/users/legacy/sign-in">

				{/* "Sign in" */}
				<h2 style={ styles.form_title }>
					{ translate(user_bar_messages.sign_in) }
				</h2>

				<p>
					{ translate(messages.enter_access_code) }
				</p>

				<div className="rrui__form__fields">
					{/* "Access code" */}
					<Text_input
						name="code"
						error={ this.access_code_error(sign_in_with_access_code_error) }
						validate={ this.validate_access_code }
						label={ translate(messages.access_code) }/>
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

	async sign_in_with_access_code(fields)
	{
		try
		{
			const
			{
				access_code_id,
				sign_in_with_access_code,
				signed_in,
				preload_started,
				focus,
				clear,
				router:
				{
					location
				}
			}
			= this.props

			await sign_in_with_access_code
			({
				id   : access_code_id,
				code : fields.code
			})

			// Hide the modal
			signed_in()

			// Refresh the page so that `authentication_token`
			// is applied to the `http` tool.

			preload_started()

			// Redirect to the original destination
			// if got here due to not being authenticated, etc.
			if (location.pathname === '/unauthenticated'
				|| location.pathname === '/unauthorized'
				|| location.pathname === '/sign-in'
				|| location.pathname === '/register')
			{
				return window.location = should_redirect_to(location)
			}

			// Refresh the current page after login
			window.location = location.pathname + (location.search || '') + (location.hash || '')
		}
		catch (error)
		{
			console.error(error)
		}
	}

	sign_in_with_access_code_error(error)
	{
		const { translate } = this.props

		if (!error)
		{
			return
		}

		if (error.field === 'access_code')
		{
			return
		}

		if (error.message === 'Access code attempts limit exceeded')
		{
			return translate(sign_in_messages.login_attempts_limit_exceeded_error)
		}

		return translate(sign_in_messages.sign_in_error)
	}

	access_code_error(error)
	{
		const { translate } = this.props

		if (!error)
		{
			return
		}

		if (error.field !== 'access_code')
		{
			return
		}

		if (error.status === http_status_codes.Access_denied)
		{
			return translate(messages.wrong_access_code)
		}
	}

	validate_access_code(value)
	{
		const { translate } = this.props

		if (!value)
		{
			return translate(messages.access_code_is_required)
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
	enter_access_code:
	{
		id             : 'authentication.enter_access_code',
		description    : 'An instruction for a user to enter the access code he has just received in the email (or via SMS, in some future)',
		defaultMessage : `Enter the access code from an email message you're gonna receive in a few moments`
	},
	access_code:
	{
		id             : 'authentication.access_code',
		description    : 'Access code',
		defaultMessage : 'Access code'
	},
	access_code_is_required:
	{
		id             : 'authentication.error.access_code.is_required',
		description    : 'Access code field value can\'t be empty',
		defaultMessage : 'Enter the access code'
	},
	wrong_access_code:
	{
		id             : 'authentication.error.access_code.mismatch',
		description    : 'The access code doesn\'t match the one sent in the message',
		defaultMessage : 'Wrong access code'
	}
})