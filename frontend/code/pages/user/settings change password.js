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
		this.set_next_step                 = this.set_next_step.bind(this)
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
				<Change_password ref="change_password_steps" set_next_step={this.set_next_step} on_finished={this.props.onRequestClose}/>
			</Modal>
		)

		return markup
	}

	change_password_steps_actions()
	{
		const { translate } = this.props

		let has_next = true

		if (this.refs.change_password_steps)
		{
			has_next = this.state.step < this.refs.change_password_steps.step_count()
		}

		if (has_next)
		{
			const result =
			[{
				text   : translate(default_messages.next),
				action : () => this.refs.change_password_steps.change_password_steps_next()
			}]

			return result
		}

		const result =
		[{
			text   : translate(default_messages.done),
			action : this.refs.change_password_steps.change_password_steps_done
		}]

		return result
	}

	set_next_step(step)
	{
		this.setState({ step })
	}
}

// Change password steps
class Change_password extends Component
{
	state = {}

	static propTypes =
	{
		set_next_step : PropTypes.func.isRequired,
		on_finished   : PropTypes.func.isRequired
	}

	constructor(props, context)
	{
		super(props, context)

		this.change_password_steps_next = this.change_password_steps_next.bind(this)
		this.change_password_steps_done = this.change_password_steps_done.bind(this)

		this.next = this.next.bind(this)
		this.done = this.done.bind(this)
	}

	render()
	{
		{/* Change password steps */}
		const markup =
		(
			<Steps {...this.props} ref="steps">
				{/* Enter current password */}
				<Change_password_step_1 ref="1" submit={this.next}/>

				{/* Enter new password */}
				<Change_password_step_2 ref="2" submit={this.next} state={this.state}/>

				{/* Enter new password again */}
				<Change_password_step_3 ref="3" submit={this.done} state={this.state}/>
			</Steps>
		)

		return markup
	}

	async change_password_steps_next()
	{
		const { next_step, ...rest } = await this.submit()

		this.setState(rest)

		if (next_step)
		{
			this.props.set_next_step(next_step)
		}
	}

	async change_password_steps_done()
	{
		const { next_step, ...rest } = await this.submit()

		if (next_step)
		{
			this.props.on_finished()
		}
	}

	async submit()
	{
		const step = this.refs[this.refs.steps.step()]

		// if (step.submit)
		// {
		// 	await step.submit()
		// }

		return await step.submit(this.state)
	}

	next()
	{
		return this.refs.steps.next()
	}

	step_count()
	{
		return this.refs.steps.step_count()
	}

	done()
	{
		return this.refs.steps.done()
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

	async submit(state)
	{
		const next_step = await this.refs.form.submit()

		if (next_step)
		{
			return { ...state, next_step, old_password: this.state.value }
		}

		return state
	}

	submit_form()
	{
		alert('check password ' + this.state.value)

		return this.props.submit()
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

	async submit(state)
	{
		const next_step = await this.refs.form.submit()
		
		if (next_step)
		{
			return { ...state, next_step, new_password: this.state.value }
		}

		return state
	}

	submit_form()
	{
		alert('entered new password ' + this.state.value)

		return this.props.submit()
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

	async submit(state)
	{
		const next_step = await this.refs.form.submit()

		if (next_step)
		{
			return { ...state, next_step }
		}

		return state
	}

	submit_form()
	{
		alert('entered new password again ' + this.state.value)

		return this.props.submit()
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
