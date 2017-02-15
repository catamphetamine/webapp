import React, { Component, PropTypes } from 'react'
import styler                          from 'react-styling'
import classNames                      from 'classnames'
import { defineMessages }              from 'react-intl'
import { connect }                     from 'react-redux'
import { bindActionCreators as bind_action_creators } from 'redux'

import
{
	check_current_password,
	reset_check_current_password_error,
	change_password,
	reset_change_password_error,
	connector
}
from '../../redux/user/settings/change password'

import Editable_field  from '../../components/editable field'
import Modal from '../../components/modal'
import Steps, { Text_input_step } from '../../components/steps'
import default_messages from '../../components/messages'
// import { messages as authentication_messages } from '../../components/authentication form'

import http_status_codes from '../../tools/http status codes'

import international from '../../international/internationalize'

export const messages = defineMessages
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
		defaultMessage : `Current password`
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
	},
	change_password_failed:
	{
		id             : 'user.settings.password.change_failed',
		description    : `Something went wrong while changing user's password`,
		defaultMessage : `Couldn't change your password`
	},
	password_updated:
	{
		id             : 'user.settings.password.password_updated',
		description    : `User's new password has been saved`,
		defaultMessage : `Password updated`
	}
})

@international
export default class Change_password extends Component
{
	state = {}

	constructor()
	{
		super()

		this.change_password        = this.change_password.bind(this)
		this.cancel_change_password = this.cancel_change_password.bind(this)
	}

	render()
	{
		const { translate } = this.props
		const { changing_password } = this.state

		// {/* User's password */}

		const markup =
		(
			<Editable_field
				label={'translate(authentication_messages.password)'}
				edit={this.change_password}>

				{/* Change password popup */}
				<Change_password_popup
					isOpen={changing_password}
					close={this.cancel_change_password}/>
			</Editable_field>
		)

		return markup
	}

	change_password()
	{
		this.setState({ changing_password: true, step: 1 })
	}

	cancel_change_password()
	{
		this.setState({ changing_password: false })
	}

	validate_password(value)
	{
		if (!value)
		{
			// return this.props.translate(authentication_messages.registration_password_is_required)
		}
	}
}

// {/* Change password popup */}
@international
@connect
(
	(state) =>
	({
		...connect(state.user_settings.change_password)
	}),
	dispatch =>
	({
		dispatch,
		...bind_action_creators
		({
			check_current_password,
			reset_check_current_password_error,
			change_password,
			reset_change_password_error
		},
		dispatch)
	})
)
class Change_password_popup extends Component
{
	state = {}

	static propTypes =
	{
		isOpen : PropTypes.bool,
		close  : PropTypes.func.isRequired
	}

	constructor()
	{
		super()

		this.change_password_steps_actions = this.change_password_steps_actions.bind(this)

		this.set_last_step = this.set_last_step.bind(this)
		this.finished      = this.finished.bind(this)
		this.reset_modal   = this.reset_modal.bind(this)
	}

	render()
	{
		const
		{
			check_current_password,
			check_current_password_pending,
			check_current_password_error,
			reset_check_current_password_error,

			change_password,
			change_password_pending,
			change_password_error,
			reset_change_password_error,

			isOpen,
			close,

			translate
		}
		= this.props

		const markup =
		(
			<Modal
				title={translate(messages.change_password)}
				isOpen={isOpen}
				close={close}
				reset={this.reset_modal}
				cancel={true}
				busy={check_current_password_pending || change_password_pending}
				actions={this.change_password_steps_actions()}>

				{/* Change password steps */}
				<Steps
					ref={ref => this.change_password_steps = ref}
					set_last_step={this.set_last_step}
					on_finished={this.finished}>

					{/* Enter current password */}
					<Change_password_step_1
						busy={check_current_password_pending}
						action={check_current_password}
						error={check_current_password_error}
						reset_error={reset_check_current_password_error}/>

					{/* Enter new password */}
					<Change_password_step_2/>

					{/* Enter new password again */}
					<Change_password_step_3
						busy={change_password_pending}
						action={change_password}
						error={change_password_error}
						reset_error={reset_change_password_error}/>
				</Steps>
			</Modal>
		)

		return markup
	}

	change_password_steps_actions()
	{
		const
		{
			check_current_password_pending,
			change_password_pending,
			translate
		}
		= this.props

		const result =
		[{
			text      : this.state.is_last_step ? translate(default_messages.done) : translate(default_messages.next),
			action    : () => this.change_password_steps.submit(),
			className : 'button--primary',
			busy      : check_current_password_pending || change_password_pending
		}]

		return result
	}

	set_last_step(is_last_step)
	{
		this.setState({ is_last_step })
	}

	reset_modal()
	{
		this.props.reset_check_current_password_error()
		this.props.reset_change_password_error()

		this.setState({ is_last_step: false })
	}

	finished()
	{
		this.props.dispatch({ type: 'snack', snack: this.props.translate(messages.password_updated) })
		this.props.close()
	}
}

// Enter current password
class Change_password_step_1 extends Component
{
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
		this.submit_step       = this.submit_step.bind(this)
		this.reset_error       = this.reset_error.bind(this)
	}

	componentDidMount()
	{
		// Because the first step is mounted before
		// the react-modal contents are mounted,
		// focus after the modal has been mounted.
		setTimeout(this.step.focus, 0)
	}

	render()
	{
		const { error, busy } = this.props

		const translate = this.context.intl.formatMessage

		const markup =
		(
			<Text_input_step
				ref={ref => this.step = ref}
				password={true}
				description={translate(messages.enter_current_password)}
				error={error && !this.wrong_password(error) && this.error_message(error)}
				input_error={error && this.wrong_password(error)}
				validate={this.validate_password}
				busy={busy}
				placeholder={translate(messages.current_password)}
				action={this.submit_step}
				reset_error={this.reset_error}/>
		)

		return markup
	}

	// Public API
	submit()
	{
		this.step.submit()
	}

	async submit_step(values)
	{
		const { submit, action } = this.props
		const value = values.input

		try
		{
			// Check current password
			await action(value)

			// The current password matches, proceed to the next step
			submit({ ...this.props.state, old_password: value })
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
				this.step.clear('input', this.validate_password())
				this.step.focus()
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

	wrong_password(error)
	{
		const translate = this.context.intl.formatMessage

		// Don't show "Password required" when it's deliberately being reset
		// due to "Wrong password" error.
		if (error.status === http_status_codes.Input_rejected)
		{
			// return translate(authentication_messages.wrong_password)
		}
	}

	error_message(error)
	{
		const translate = this.context.intl.formatMessage

		return translate(messages.check_current_password_failed)
	}

	// Reset form error before running form field validation
	reset_error()
	{
		this.props.reset_error()
	}
}

// Enter new password
class Change_password_step_2 extends Component
{
	state = {}

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
		setTimeout(this.step.focus, 0)
	}

	render()
	{
		const translate = this.context.intl.formatMessage

		const markup =
		(
			<Text_input_step
				ref={ref => this.step = ref}
				password={true}
				description={translate(messages.enter_new_password)}
				validate={this.validate_password}
				placeholder={translate(messages.new_password)}
				action={this.submit_step}/>
		)

		return markup
	}

	// Public API
	submit()
	{
		this.step.submit()
	}

	submit_step(values)
	{
		const value = values.input

		this.props.submit({ ...this.props.state, new_password: value })
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
		this.submit_step       = this.submit_step.bind(this)
		this.reset_error       = this.reset_error.bind(this)
	}

	componentDidMount()
	{
		setTimeout(this.step.focus, 0)
	}

	render()
	{
		const { busy, error } = this.props

		const translate = this.context.intl.formatMessage

		const markup =
		(
			<Text_input_step
				ref={ref => this.step = ref}
				password={true}
				description={translate(messages.enter_new_password_again)}
				error={error && this.error_message(error)}
				input_error={this.state.error}
				validate={this.validate_password}
				busy={busy}
				placeholder={translate(messages.new_password)}
				action={this.submit_step}
				reset_error={this.reset_error}/>
		)

		return markup
	}

	// Public API
	submit()
	{
		this.step.submit()
	}

	async submit_step(values)
	{
		const translate = this.context.intl.formatMessage

		const { action, state, submit } = this.props
		const value = values.input

		// If the new password is misspelled,
		// then reset the input field
		// and show "Password misspelled" error instead of "Missing input"
		if (value !== state.new_password)
		{
			// this.setState({ value: '', error: translate(messages.new_password_misspelled) })
			this.step.focus()
			return
		}

		// Change password
		await action
		({
			old_password : state.old_password,
			new_password : state.new_password
		})

		// Finished
		submit()
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

		return translate(messages.change_password_failed)
	}

	// Reset form error before running form field validation
	reset_error()
	{
		this.setState({ error: undefined })
		this.props.reset_error()
	}
}
