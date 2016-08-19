import React, { Component, PropTypes } from 'react'
import styler                          from 'react-styling'
import classNames                      from 'classnames'
import { defineMessages }              from 'react-intl'

import Modal           from '../../components/modal'
import Steps, { Text_input_step } from '../../components/steps'

import default_messages from '../../components/messages'

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
	}
})

{/* Change password popup */}
@international()
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

	render()
	{
		const { translate } = this.props

		const markup =
		(
			<Modal
				title={translate(messages.change_password)}
				isOpen={this.props.isOpen}
				onRequestClose={this.props.onRequestClose}
				cancel={true}
				actions={this.change_password_steps_actions()}>

				{/* Change password steps */}
				<Steps
					ref="change_password_steps"
					set_last_step={this.set_last_step}
					on_finished={this.props.onRequestClose}>

					{/* Enter current password */}
					<Change_password_step_1/>

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
		const { translate } = this.props

		const result =
		[{
			text   : this.state.is_last_step ? translate(default_messages.done) : translate(default_messages.next),
			action : () => this.refs.change_password_steps.submit(),
			primary : true
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
		const translate = this.context.intl.formatMessage

		const markup =
		(
			<Text_input_step
				ref="step"
				password={true}
				description={translate(messages.enter_current_password)}
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

	submit_step(old_password)
	{
		alert('check password ' + old_password)

		// if (this.props.on_busy)
		// {
		// 	this.props.on_busy()
		// }
		//
		// await check_password(old_password)

		this.props.submit({ ...this.props.state, old_password })
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

		// if (this.props.on_busy)
		// {
		// 	this.props.on_busy()
		// }
		//
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
