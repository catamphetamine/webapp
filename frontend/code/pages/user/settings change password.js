import React, { Component, PropTypes } from 'react'
import styler                          from 'react-styling'
import classNames                      from 'classnames'
import { defineMessages }              from 'react-intl'

import Text_input      from '../../components/text input'
import Modal           from '../../components/modal'
import Steps           from '../../components/steps'
import Form            from '../../components/form'

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
			action : () => this.refs.change_password_steps.submit()
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
	state = {}

	static contextTypes =
	{
		intl : PropTypes.object
	}
	
	constructor(props, context)
	{
		super(props, context)

		this.inputs       = this.inputs.bind(this)
		this.set_password = this.set_password.bind(this)
		this.submit       = this.submit.bind(this)
		this.submit_form  = this.submit_form.bind(this)

		this.validate_password = this.validate_password.bind(this)
	}

	render()
	{
		const translate = this.context.intl.formatMessage

		const markup =
		(
			<Form
				ref="form"
				inputs={this.inputs}
				action={this.submit_form}>

				<Text_input
					ref="password"
					name="password"
					password={true}
					description={translate(messages.enter_current_password)}
					value={this.state.value}
					validate={this.validate_password}
					placeholder={translate(messages.current_password)}
					on_change={this.set_password}/>
			</Form>
		)

		return markup
	}

	inputs()
	{
		return [this.refs.password]
	}

	submit()
	{
		this.refs.form.submit()
	}

	submit_form()
	{
		alert('check password ' + this.state.value)
		
		// if (this.props.on_busy)
		// {
		// 	this.props.on_busy()
		// }
		//
		// await check_password(this.state.value)

		this.props.submit({ ...this.props.state, old_password: this.state.value })
	}

	set_password(value)
	{
		this.setState({ value })
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
	state = {}

	static contextTypes =
	{
		intl : PropTypes.object
	}
	
	constructor(props, context)
	{
		super(props, context)

		this.inputs       = this.inputs.bind(this)
		this.set_password = this.set_password.bind(this)
		this.submit       = this.submit.bind(this)
		this.submit_form  = this.submit_form.bind(this)

		this.validate_password = this.validate_password.bind(this)
	}

	render()
	{
		const translate = this.context.intl.formatMessage

		const markup =
		(
			<Form
				ref="form"
				inputs={this.inputs}
				action={this.submit_form}>

				<Text_input
					ref="password"
					name="password"
					password={true}
					description={translate(messages.enter_new_password)}
					value={this.state.value}
					validate={this.validate_password}
					placeholder={translate(messages.new_password)}
					on_change={this.set_password}/>
			</Form>
		)

		return markup
	}

	inputs()
	{
		return [this.refs.password]
	}

	submit(state)
	{
		this.refs.form.submit()
	}

	submit_form()
	{
		this.props.submit({ ...this.props.state, new_password: this.state.value })
	}

	set_password(value)
	{
		this.setState({ value })
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

	static contextTypes =
	{
		intl : PropTypes.object
	}
	
	constructor(props, context)
	{
		super(props, context)

		this.inputs       = this.inputs.bind(this)
		this.set_password = this.set_password.bind(this)
		this.submit       = this.submit.bind(this)
		this.submit_form  = this.submit_form.bind(this)

		this.validate_password = this.validate_password.bind(this)
	}

	render()
	{
		const translate = this.context.intl.formatMessage

		const markup =
		(
			<Form
				ref="form"
				inputs={this.inputs}
				action={this.submit_form}>

				<Text_input
					ref="password"
					name="password"
					password={true}
					description={translate(messages.enter_new_password_again)}
					value={this.state.value}
					validate={this.validate_password}
					placeholder={translate(messages.new_password)}
					on_change={this.set_password}/>
			</Form>
		)

		return markup
	}

	inputs()
	{
		return [this.refs.password]
	}

	submit(state)
	{
		this.refs.form.submit()
	}

	submit_form()
	{
		alert('change password to ' + this.state.value)

		// if (this.props.on_busy)
		// {
		// 	this.props.on_busy()
		// }
		//
		// await change_password(this.props.state.old_password, this.props.state.new_password)

		this.props.submit(this.props.state)
	}

	set_password(value)
	{
		this.setState({ value })
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
