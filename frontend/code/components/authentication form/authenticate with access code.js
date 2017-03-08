import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { flat as style } from 'react-styling'
import { defineMessages, FormattedMessage } from 'react-intl'
import { Form } from 'react-responsive-ui'
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
		...connector(state.authentication),
		locale : state.locale.locale
	}),
	{
		authenticate,
		reset_authenticate_error
	}
)
@international
export default class Authenticate_with_access_code extends Component
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
				submit={ submit(reset_authenticate_error, this.authenticate) }
				busy={ submitting }
				error={ this.authenticate_error(authenticate_error) }
				post="/authentication/legacy/sign-in">

				{/* "Sign in" */}
				<h2 style={ styles.form_title }>
					{ title }
				</h2>

				<p>
					{ translate(messages.enter_access_code) }
				</p>

				<div className="rrui__form__fields">
					{/* "Access code" */}
					<Text_input
						name="code"
						error={ this.access_code_error(authenticate_error) }
						validate={ this.validate_access_code }
						label={ translate(messages.access_code) }/>
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
				id    : authentication.pending.find_by({ type: 'access code' }).id,
				value : fields.code
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

		if (this.access_code_error(error))
		{
			return
		}

		if (error.message === 'Authentication expired')
		{
			return translate(messages.access_code_expired)
		}

		if (error.message === 'Maximum tries count reached')
		{
			return translate(messages.access_code_expired)
		}

		if (error.message === 'Authentication attempts limit exceeded')
		{
			return authentication_attempts_limit_exceeded_error(error)
		}

		return translate(messages.error)
	}

	access_code_error(error)
	{
		const { translate } = this.props

		if (!error)
		{
			return
		}

		if (error.status === http_status_codes.Input_rejected)
		{
			return translate(messages.wrong_access_code)
		}
	}

	validate_access_code = (value) =>
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
	error:
	{
		id             : 'authentication.access_code.error',
		description    : 'A generic authentication failed message',
		defaultMessage : `Couldn't authenticate with access code`
	},
	enter_access_code:
	{
		id             : 'authentication.enter_access_code',
		description    : 'An instruction for a user to enter the access code he has just received in the email (or via SMS, in some future)',
		defaultMessage : `Enter the access code from an email message you've just received (or gonna receive in a few moments)`
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
	},
	access_code_expired:
	{
		id             : 'authentication.error.access_code.expired',
		description    : 'The access code has expired and the user should generate a new one',
		defaultMessage : 'This access code has expired. Start signing in all over again.'
	}
})