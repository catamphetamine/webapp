import React, { Component, PropTypes } from 'react'
import styler                          from 'react-styling'
import classNames                      from 'classnames'
import { defineMessages }              from 'react-intl'
import { connect }                     from 'react-redux'

import
{
	check_password,
	reset_check_password_error,
	change_email,
	reset_change_email_error,
	connector
}
from '../../redux/user/settings/main'

import { snack } from '../../redux/snackbar'

import http_status_codes from '../../tools/http status codes'

import international from '../../international/internationalize'

import Modal          from '../../components/modal'
import Editable_field from '../../components/editable field'
import TextInput      from '../../components/form/text input'

import { Form } from 'react-responsive-ui'

import Redux_form, { Field } from 'simpler-redux-form'

import default_messages from '../../components/messages'
import { messages as authentication_messages } from '../../components/authentication form/sign in'
import { messages as password_authentication_messages } from '../../components/authentication form/sign in with password'
import { messages as change_password_messages } from './settings change password'

@connect
(
	({ user_settings }) =>
	({
		...connector(user_settings.main)
	}),
	{
		change_email,
		reset_change_email_error,
		snack
	}
)
@international
export default class Change_email extends Component
{
	state = {}

	constructor()
	{
		super()

		this.validate_email              = this.validate_email.bind(this)
		this.dismiss_check_password      = this.dismiss_check_password.bind(this)
		this.update_email                = this.update_email.bind(this)
		this.save_new_email              = this.save_new_email.bind(this)
		this.cancel_change_email         = this.cancel_change_email.bind(this)
	}

	reset_error()
	{
		const { reset_change_email_error } = this.props

		reset_change_email_error()
	}

	error_message(error)
	{
		const { translate } = this.props

		if (!error)
		{
			return
		}

		return translate(messages.change_email_failed)
	}

	render()
	{
		const
		{
			user,
			translate,
			change_email_pending,
			change_email_error
		}
		= this.props

		const
		{
			new_email,
			changing_email
		}
		= this.state

		// {/* User's email */}
		const markup =
		(
			<Editable_field
				name="email"
				email
				label={translate(authentication_messages.email)}
				value={new_email || user.email}
				validate={this.validate_email}
				save={this.save_new_email}
				cancel={this.cancel_change_email}
				editing={changing_email}
				saving={change_email_pending}
				error={this.error_message(change_email_error)}>

				{/* Password check popup */}
				<Check_password_popup
					isOpen={this.state.check_password}
					close={this.dismiss_check_password}
					done={this.update_email}/>
			</Editable_field>
		)

		return markup
	}

	validate_email(value)
	{
		if (!value)
		{
			return this.props.translate(messages.enter_new_email)
		}
	}

	check_password()
	{
		this.setState({ check_password: true })
	}

	dismiss_check_password()
	{
		this.setState
		({
			check_password : false
		})

		this.cancel_change_email()
	}

	cancel_change_email()
	{
		this.reset_error()

		this.setState
		({
			changing_email : false,
			new_email      : undefined
		})
	}

	async update_email(password)
	{
		const { change_email, translate, snack } = this.props
		const { new_email } = this.state

		await change_email(new_email, password)

		snack(translate(messages.email_updated))

		this.setState({ changing_email : false })
	}

	save_new_email(value)
	{
		const { user } = this.props

		if (value !== user.email)
		{
			this.setState
			({
				changing_email : true,
				new_email      : value
			})

			this.check_password()
		}
	}
}

@international
@connect
(
	({ user_settings }) =>
	({
		check_password_pending : user_settings.main.check_password_pending,
		check_password_error   : user_settings.main.check_password_error,
	}),
	{
		check_password,
		reset_check_password_error
	}
)
class Check_password_popup extends Component
{
	state = {}

	static propTypes =
	{
		isOpen  : PropTypes.bool,
		close   : PropTypes.func.isRequired,
		done    : PropTypes.func.isRequired
	}

	constructor()
	{
		super()

		this.done = this.done.bind(this)
	}

	render()
	{
		const
		{
			check_password_pending,
			check_password_error,

			check_password,
			reset_check_password_error,

			isOpen,
			close,

			translate
		}
		= this.props

		const markup =
		(
			<Modal
				title={translate(messages.password_check)}
				isOpen={isOpen}
				close={close}
				reset={reset_check_password_error}
				cancel
				busy={check_password_pending}
				actions=
				{[{
					text      : translate(default_messages.done),
					action    : () => this.check_password.ref().submit(),
					className : 'button--primary',
					busy      : check_password_pending
				}]}>

				<Check_password
					ref={ref => this.check_password = ref}
					submit_form={this.done}
					action={check_password}
					error={check_password_error}
					reset_error={reset_check_password_error}/>
			</Modal>
		)

		return markup
	}

	done(password)
	{
		this.props.done(password)
		this.props.close()
	}
}

@Redux_form
class Check_password extends Component
{
	state = {}

	static propTypes =
	{
		action      : PropTypes.func.isRequired,
		submitting  : PropTypes.bool,
		error       : PropTypes.object,
		reset_error : PropTypes.func.isRequired
	}

	static contextTypes =
	{
		intl : PropTypes.object
	}

	constructor(props, context)
	{
		super(props, context)

		this.validate_password = this.validate_password.bind(this)
		this.submit            = this.submit.bind(this)
		this.submit_form       = this.submit_form.bind(this)
		this.reset_error       = this.reset_error.bind(this)
	}

	componentDidMount()
	{
		// Because this component is mounted before
		// the react-modal contents are mounted,
		// focus after the modal has been mounted.
		setTimeout(() => this.props.focus('input'), 0)
	}

	render()
	{
		const { error, submitting, submit } = this.props

		const translate = this.context.intl.formatMessage

		const markup =
		(
			<Form
				ref={ref => this.form = ref}
				busy={submitting}
				action={submit(this.reset_error, this.submit_form)}
				error={error && this.error_message(error)}>

				<TextInput
					name="input"
					password
					description={translate(messages.enter_password)}
					placeholder={translate(messages.password)}
					error={this.password_error()}
					validate={this.validate_password}/>
			</Form>
		)

		return markup
	}

	// Public API
	submit()
	{
		this.form.submit()
	}

	// Reset form error before running form field validation
	reset_error()
	{
		this.props.reset_error()
	}

	async submit_form(values)
	{
		const { submit_form, action, focus, clear } = this.props
		const value = values.input

		try
		{
			// Check current password
			await action(value)

			// The current password matches
			submit_form(value)
		}
		catch (error)
		{
			// Swallows Http errors and Rest Api errors
			// so that they're not output to the console
			if (!error.status)
			{
				throw error
			}

			// Focus password input field on wrong password
			if (error.status === http_status_codes.Input_rejected)
			{
				clear('input', this.validate_password())
				focus('input')
			}
		}
	}

	validate_password(value)
	{
		const translate = this.context.intl.formatMessage

		if (!value)
		{
			return translate(change_password_messages.password_is_required)
		}
	}

	error_message(error)
	{
		const translate = this.context.intl.formatMessage

		// "Wrong password" error will belong to the password field
		if (error.status === http_status_codes.Input_rejected)
		{
			return
		}

		return translate(change_password_messages.check_current_password_failed)
	}

	password_error()
	{
		const translate = this.context.intl.formatMessage

		const { error } = this.props

		// Don't show "Password required" when it's deliberately being reset
		// due to "Wrong password" error.
		if (error && error.status === http_status_codes.Input_rejected)
		{
			return translate(password_authentication_messages.wrong_password)
		}
	}
}

const messages = defineMessages
({
	enter_new_email:
	{
		id             : 'user.settings.change_email.enter_new_email',
		description    : `An error message stating that new email hasn't been entered`,
		defaultMessage : `Enter new email`
	},
	password_check:
	{
		id             : 'user.settings.check_password.title',
		description    : `Check password popup title`,
		defaultMessage : `Security check`
	},
	enter_password:
	{
		id             : 'user.settings.check_password.enter_password',
		description    : `An invitation for a user to enter his current password`,
		defaultMessage : `Enter you password`
	},
	password:
	{
		id             : 'user.settings.check_password.password',
		description    : `User's current password`,
		defaultMessage : `Password`
	},
	email_updated:
	{
		id             : 'user.settings.change_email.email_updated',
		description    : `User's new email has been saved`,
		defaultMessage : `Email updated`
	},
	change_email_failed:
	{
		id             : 'user.settings.change_email.failed',
		description    : `An error stating that the user's email couldn't be changed to the new one`,
		defaultMessage : `Couldn't update your email`
	}
})