import React, { Component, PropTypes } from 'react'
import styler                          from 'react-styling'
import classNames                      from 'classnames'
import { defineMessages }              from 'react-intl'
import { connect }                     from 'react-redux'
import { bindActionCreators as bind_action_creators } from 'redux'

import { check_password, reset_check_password_error } from '../../actions/user settings/main'

import http_status_codes from '../../tools/http status codes'

import international from '../../international/internationalize'

import Modal from '../../components/modal'
import Form from '../../components/form'
import Text_input from '../../components/text input'

import default_messages from '../../components/messages'
import { messages as authentication_messages } from '../../components/authentication form'
import { messages as change_password_messages } from './settings change password'

const messages = defineMessages
({
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
export default class Check_password_popup extends Component
{
	state = {}

	static propTypes =
	{
		is_open : PropTypes.bool,
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
				busy={check_password_pending}
				actions=
				{[{
					text    : translate(default_messages.done),
					action  : () => this.refs.check_password.submit(),
					primary : true,
					busy    : check_password_pending
				}]}>

				<Check_password
					ref="check_password"
					submit={this.done}
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

		// https://github.com/reactjs/react-modal/issues/214
		setTimeout(() =>
		{
			this.props.reset_check_password_error()
		},
		150)
	}

	done(password)
	{
		this.props.done(password)
		this.close()
	}
}

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
		this.on_change         = this.on_change.bind(this)
	}

	componentDidMount()
	{
		// Because this component is mounted before
		// the react-modal contents are mounted,
		// focus after the modal has been mounted.
		setTimeout(this.refs.input.focus, 0)
	}

	render()
	{
		const { error, busy } = this.props
		const { value } = this.state

		const translate = this.context.intl.formatMessage

		const markup =
		(
			<Form
				ref="form"
				busy={busy}
				focus={this.focus}
				action={this.submit_form}
				reset_error={this.reset_error}
				error={this.error_message(error)}>

				<Text_input
					ref="input"
					name="input"
					password={true}
					description={translate(messages.enter_password)}
					placeholder={translate(messages.password)}
					value={value}
					disabled={busy}
					invalid={this.invalid()}
					on_change={this.on_change}/>
			</Form>
		)

		return markup
	}

	// Public API
	submit()
	{
		this.refs.input.submit()
	}

	// Reset form error before running form field validation
	reset_error()
	{
		this.props.reset_error()
	}

	async submit_form()
	{
		const { submit, action } = this.props
		const { value } = this.state

		try
		{
			// Check current password
			await action(value)

			// The current password matches
			submit(value)
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
				this.setState({ value: '' })
				this.refs.input.focus()
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

		if (!error)
		{
			return
		}

		if (error.status === http_status_codes.Input_rejected)
		{
			return
		}

		return translate(change_password_messages.check_current_password_failed)
	}

	on_change(value)
	{
		this.setState({ value })
		this.props.reset_error()
	}

	invalid()
	{
		const translate = this.context.intl.formatMessage

		const { error } = this.props
		const { value } = this.state

		// Don't show "Password required" when it's deliberately being reset
		// due to "Wrong password" error.
		if (error && error.status === http_status_codes.Input_rejected)
		{
			return translate(authentication_messages.wrong_password)
		}

		return this.validate_password(value)
	}
}