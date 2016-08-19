import React, { Component, PropTypes } from 'react'
import styler                          from 'react-styling'
import classNames                      from 'classnames'
import { defineMessages }              from 'react-intl'
import { connect }                     from 'react-redux'
import { bindActionCreators as bind_action_creators } from 'redux'

import { check_current_password, reset_check_current_password_error } from '../../actions/user settings/change password'

import Modal from '../../components/modal'
import Steps, { Text_input_step } from '../../components/steps'
import default_messages from '../../components/messages'
import { messages as authentication_messages } from '../../components/authentication form'

import http_status_codes from '../../tools/http status codes'

import international from '../../international/internationalize'

const messages = defineMessages
({
	// Change password popup
	change_password:
	{
		id             : 'user.settings.password.change',
		description    : `Change user's own password popup title`,
		defaultMessage : `Change password`
	},
	current_password:
	{
		id             : 'user.settings.password.current',
		description    : `User's current password`,
		defaultMessage : `Change password`
	},
	new_password:
	{
		id             : 'user.settings.password.new',
		description    : `User's new password`,
		defaultMessage : `New password`
	},
	enter_current_password:
	{
		id             : 'user.settings.password.enter_current',
		description    : `An invitation for a user to enter his current password`,
		defaultMessage : `Enter you current password`
	},
	enter_new_password:
	{
		id             : 'user.settings.password.enter_new',
		description    : `An invitation for a user to enter a new password`,
		defaultMessage : `Enter new password`
	},
	enter_new_password_again:
	{
		id             : 'user.settings.password.enter_new_again',
		description    : `An invitation for a user to enter a new password again`,
		defaultMessage : `Enter new password again`
	},
	password_is_required:
	{
		id             : 'user.settings.password.is_required',
		description    : `An error message for user stating that a password is required`,
		defaultMessage : `Enter the password`
	},
	new_password_misspelled:
	{
		id             : 'user.settings.password.new_misspelled',
		description    : `An error message for user stating that the new password entered the second time didn't match the new password enetered the first time`,
		defaultMessage : `You misspelled the new password. Try again`
	},
	check_current_password_failed:
	{
		id             : 'user.settings.password.check_current_failed',
		description    : `Something went wrong while checking user's current password`,
		defaultMessage : `Couldn't verify your password`
	}
})

{/* Change password popup */}
@international()
@connect
(
	model => 
	({
		checking_current_password : model.user_settings.change_password.checking_current_password,

		check_current_password_error : model.user_settings.change_password.check_current_password_error
	}),
	dispatch => bind_action_creators
	({
		check_current_password,
		reset_check_current_password_error
	},
	dispatch)
)
export default class Change_password_popup extends Component
{
	state = {}

	static propTypes =
	{
		isOpen         : PropTypes.bool,
		onRequestClose : PropTypes.func.isRequired
	}

	constructor(props, context)
	{
		super(props, context)

		this.change_password_steps_actions = this.change_password_steps_actions.bind(this)

		this.set_last_step = this.set_last_step.bind(this)
	}

	componentWillUnmount()
	{
		this.props.reset_check_current_password_error()
	}

	render()
	{
		const { check_current_password, checking_current_password, check_current_password_error, translate } = this.props

		const markup =
		(
			<Modal
				title={translate(messages.change_password)}
				isOpen={this.props.isOpen}
				onRequestClose={this.props.onRequestClose}
				cancel={true}
				busy={checking_current_password}
				actions={this.change_password_steps_actions()}>

				{/* Change password steps */}
				<Steps
					ref="change_password_steps"
					set_last_step={this.set_last_step}
					on_finished={this.props.onRequestClose}>

					{/* Enter current password */}
					<Change_password_step_1
						busy={checking_current_password}
						action={check_current_password}
						error={check_current_password_error}/>

					{/* Enter new password */}
					<Change_password_step_2/>

					{/* Enter new password again */}
					<Change_password_step_3/>
				</Steps>
			</Modal>
		)

		return markup
	}

	change_password_steps_actions()
	{
		const { checking_current_password, translate } = this.props

		const result =
		[{
			text    : this.state.is_last_step ? translate(default_messages.done) : translate(default_messages.next),
			action  : () => this.refs.change_password_steps.submit(),
			primary : true,
			busy    : checking_current_password
		}]

		return result
	}

	set_last_step(is_last_step)
	{
		this.setState({ is_last_step })
	}
}

// Enter current password
class Change_password_step_1 extends Component
{
	static propTypes =
	{
		action  : PropTypes.func.isRequired,
		busy    : PropTypes.bool,
		error   : PropTypes.object
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
		this.submit_step       = this.submit_step.bind(this)
	}

	componentDidMount()
	{
		// Because the first step is mounted before
		// the react-modal contents are mounted,
		// focus after the modal has been mounted.
		setTimeout(this.refs.step.focus, 0)
	}

	render()
	{
		const { error, busy } = this.props

		const translate = this.context.intl.formatMessage

		const markup =
		(
			<Text_input_step
				ref="step"
				password={true}
				description={translate(messages.enter_current_password)}
				error={this.error_message(error)}
				busy={busy}
				validate={this.validate_password}
				placeholder={translate(messages.current_password)}
				submit={this.submit_step}/>
		)

		return markup
	}

	// Public API
	submit()
	{
		this.refs.step.submit()
	}

	async submit_step(old_password)
	{
		const { submit, action } = this.props

		try
		{
			// Check current password
			await action(old_password)

			// The current password matches, proceed to the next step
			submit({ ...this.props.state, old_password })
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
				this.refs.step.focus()
			}
		}
	}

	validate_password(value)
	{
		const translate = this.context.intl.formatMessage

		if (!value)
		{
			return translate(messages.password_is_required)
		}
	}

	error_message(error)
	{
		const translate = this.context.intl.formatMessage

		if (!error)
		{
			return
		}

		if (error.status = http_status_codes.Input_rejected)
		{
			return translate(authentication_messages.wrong_password)
		}

		return translate(messages.check_current_password_error)
	}
}

// Enter new password
class Change_password_step_2 extends Component
{
	static contextTypes =
	{
		intl : PropTypes.object
	}
	
	constructor(props, context)
	{
		super(props, context)

		this.validate_password = this.validate_password.bind(this)
		this.submit            = this.submit.bind(this)
		this.submit_step       = this.submit_step.bind(this)
	}

	componentDidMount()
	{
		this.refs.step.focus()
	}

	render()
	{
		const translate = this.context.intl.formatMessage

		const markup =
		(
			<Text_input_step
				ref="step"
				password={true}
				description={translate(messages.enter_new_password)}
				validate={this.validate_password}
				placeholder={translate(messages.new_password)}
				submit={this.submit_step}/>
		)

		return markup
	}

	// Public API
	submit()
	{
		this.refs.step.submit()
	}

	submit_step(new_password)
	{
		this.props.submit({ ...this.props.state, new_password })
	}

	validate_password(value)
	{
		const translate = this.context.intl.formatMessage

		if (!value)
		{
			return translate(messages.password_is_required)
		}
	}
}

// Enter new password again
class Change_password_step_3 extends Component
{
	static contextTypes =
	{
		intl : PropTypes.object
	}
	
	constructor(props, context)
	{
		super(props, context)

		this.validate_password = this.validate_password.bind(this)
		this.submit            = this.submit.bind(this)
		this.submit_step       = this.submit_step.bind(this)
	}

	componentDidMount()
	{
		this.refs.step.focus()
	}

	render()
	{
		const translate = this.context.intl.formatMessage

		const markup =
		(
			<Text_input_step
				ref="step"
				password={true}
				description={translate(messages.enter_new_password_again)}
				validate={this.validate_password}
				placeholder={translate(messages.new_password)}
				submit={this.submit_step}/>
		)

		return markup
	}

	// Public API
	submit()
	{
		this.refs.step.submit()
	}

	submit_step(value)
	{
		alert('change password to ' + value)

		// await change_password(this.props.state.old_password, this.props.state.new_password)

		this.props.submit(this.props.state)
	}

	validate_password(value)
	{
		const translate = this.context.intl.formatMessage

		if (!value)
		{
			return translate(messages.password_is_required)
		}

		if (value !== this.props.state.new_password)
		{
			return translate(messages.new_password_misspelled)
		}
	}
}
