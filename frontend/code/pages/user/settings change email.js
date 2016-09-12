import React, { Component, PropTypes } from 'react'
import styler                          from 'react-styling'
import classNames                      from 'classnames'
import { defineMessages }              from 'react-intl'
import { connect }                     from 'react-redux'
import { bindActionCreators as bind_action_creators } from 'redux'

import
{
	check_password,
	reset_check_password_error,
	change_email
}
from '../../actions/user settings/main'

import http_status_codes from '../../tools/http status codes'

import international from '../../international/internationalize'

import Editable_field  from '../../components/editable field'
import Modal, { reset_modal } from '../../components/modal'
import Form from '../../components/form'
import Text_input from '../../components/text input'

import Redux_form, { Field } from '../../simpler-redux-form/index.es6'

import default_messages from '../../components/messages'
import { messages as authentication_messages } from '../../components/authentication form'
import { messages as change_password_messages } from './settings change password'

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
	}
})

@connect
(
	model =>
	({
		user : model.user_settings.main.user,

		// change_email_pending : model.user_settings.main.change_email_pending,
	}),
	dispatch =>
	({
		dispatch,
		...bind_action_creators
		({
			change_email
		},
		dispatch)
	})
)
@international()
export default class Change_email extends Component
{
	static propTypes =
	{
		change_email         : PropTypes.func.isRequired,
		// change_email_pending : PropTypes.bool
	}

	state = {}

	constructor(props, context)
	{
		super(props, context)

		this.validate_email              = this.validate_email.bind(this)
		this.dismiss_check_password      = this.dismiss_check_password.bind(this)
		this.update_email                = this.update_email.bind(this)
		this.save_new_email              = this.save_new_email.bind(this)
		this.cancel_change_email         = this.cancel_change_email.bind(this)
	}

	render()
	{
		const
		{
			user,
			translate,
			// change_email_pending
		}
		= this.props

		const
		{
			new_email,
			changing_email,
			saving_email
		}
		= this.state

		// {/* User's email */}
		const markup =
		(
			<Editable_field
				name="email"
				email={true}
				label={translate(authentication_messages.email)}
				value={new_email || user.email}
				validate={this.validate_email}
				on_cancel={this.cancel_change_email}
				on_save={this.save_new_email}
				editing={changing_email}
				saving={saving_email}>

				{/* Password check popup */}
				<Check_password_popup
					is_open={this.state.check_password}
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
			check_password : false,
			changing_email : false,
			new_email      : undefined
		})
	}

	cancel_change_email()
	{
		this.setState
		({
			changing_email : false,
			new_email      : undefined
		})
	}

	async update_email(password)
	{
		const { change_email, translate } = this.props
		const { new_email } = this.state

		try
		{
			this.setState({ saving_email: true })

			await change_email(new_email, password)
		}
		catch (error)
		{
			console.error(error)
			return alert(translate(messages.change_email_failed))
		}
		finally
		{
			this.setState
			({
				changing_email : false,
				saving_email   : false
			})
		}
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

@international()
@connect
(
	model =>
	({
		check_password_pending : model.user_settings.main.check_password_pending,
		check_password_error   : model.user_settings.main.check_password_error,
	}),
	dispatch => bind_action_creators
	({
		check_password,
		reset_check_password_error
	},
	dispatch)
)
class Check_password_popup extends Component
{
	state = {}

	static propTypes =
	{
		is_open : PropTypes.bool,
		busy    : PropTypes.bool,
		close   : PropTypes.func.isRequired,

		done : PropTypes.func.isRequired,

		check_password_pending : PropTypes.bool,
		check_password_error   : PropTypes.object,

		check_password             : PropTypes.func.isRequired,
		reset_check_password_error : PropTypes.func.isRequired
	}

	constructor(props, context)
	{
		super(props, context)

		this.done  = this.done.bind(this)
		this.close = this.close.bind(this)
	}

	render()
	{
		const
		{
			check_password_pending,
			check_password_error,

			check_password,
			reset_check_password_error,

			is_open,
			busy,

			translate
		}
		= this.props

		const markup =
		(
			<Modal
				title={translate(messages.password_check)}
				is_open={is_open}
				close={this.close}
				cancel={true}
				busy={check_password_pending || busy}
				actions=
				{[{
					text    : translate(default_messages.done),
					action  : () => this.refs.check_password.submit(),
					primary : true,
					busy    : check_password_pending
				}]}>

				<Check_password
					form_id="change_email_check_password"
					ref="check_password"
					submit_form={this.done}
					busy={check_password_pending}
					action={check_password}
					error={check_password_error}
					reset_error={reset_check_password_error}/>
			</Modal>
		)

		return markup
	}

	// Cleanup
	close()
	{
		this.props.close()

		reset_modal(this.props.reset_check_password_error)
	}

	done(password)
	{
		this.props.done(password)
		this.close()
	}
}

@Redux_form()
class Check_password extends Component
{
	state = {}

	static propTypes =
	{
		action      : PropTypes.func.isRequired,
		busy        : PropTypes.bool,
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
		const { error, busy, submit } = this.props

		const translate = this.context.intl.formatMessage

		const markup =
		(
			<Form
				ref="form"
				busy={busy}
				action={submit(this.reset_error, this.submit_form)}
				error={error && this.error_message(error)}>

				<Field
					component={Text_input}
					name="input"
					password={true}
					description={translate(messages.enter_password)}
					placeholder={translate(messages.password)}
					disabled={busy}
					error={this.password_error()}
					validate={this.validate_password}/>
			</Form>
		)

		return markup
	}

	// Public API
	submit()
	{
		this.refs.form.submit()
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
			return translate(authentication_messages.wrong_password)
		}
	}
}