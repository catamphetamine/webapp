import React, { Component, PropTypes } from 'react'
import styler                          from 'react-styling'
import classNames                      from 'classnames'
import { defineMessages }              from 'react-intl'
import { connect }                     from 'react-redux'
import { Form, Modal }                 from 'react-responsive-ui'
import Redux_form                      from 'simpler-redux-form'

import
{
	check_current_password,
	reset_check_current_password_error,
	change_password,
	reset_change_password_error,
	connector
}
from '../../redux/user/settings/change password'

import
{
	get_user_authentication
}
from '../../redux/user/settings/main'

import { snack } from '../../redux/snackbar'

import Editable_field  from '../../components/editable field'
import TextInput from '../../components/form/text input'
import Submit from '../../components/form/submit'
import { Steps, Step } from '../../components/steps'
import default_messages from '../../components/messages'
import { messages as password_authentication_messages } from '../../components/authentication form/authenticate with password'

import http_status_codes from '../../tools/http status codes'

import international from '../../international/internationalize'

@international
@connect
(({ user_settings }) =>
({
	authentication_info : user_settings.main.authentication_info
}))
export default class Change_password extends Component
{
	state = {}

	render()
	{
		const
		{
			check_current_password_pending,
			change_password_pending,
			authentication_info,
			translate
		}
		= this.props

		const
		{
			changing_password,
			turn_off
		}
		= this.state

		const password_set = exists(authentication_info.find_by({ type: 'password' }))

		// {/* User's password */}

		const markup =
		(
			<Editable_field
				ref={ ref => this.password = ref }
				label={ translate(password_authentication_messages.password) }
				value={ password_set }
				hideValue
				enabled={ password_set }
				disable={ this.turn_off_password }
				edit={ this.change_password }>

				{/* Change password popup */}
				<Modal
					isOpen={ changing_password }
					close={ this.cancel_change_password }
					busy={ check_current_password_pending || change_password_pending }
					closeLabel={ translate(default_messages.cancel) }>

					<Change_password_popup
						password_set={ password_set }
						turn_off={ turn_off }
						close={ this.cancel_change_password }
						reset={ this.reset }/>
				</Modal>
			</Editable_field>
		)

		return markup
	}

	change_password = () =>
	{
		this.setState
		({
			changing_password : true
		})
	}

	cancel_change_password = (done) =>
	{
		this.setState
		({
			changing_password : false
		})

		if (!done)
		{
			Editable_field.cancel(this.password)
		}
	}

	turn_off_password = () =>
	{
		this.setState
		({
			changing_password : true,
			turn_off          : true
		})
	}

	validate_password(value)
	{
		const { translate } = this.props

		if (!value)
		{
			return translate(password_authentication_messages.password_is_required)
		}
	}

	reset = () =>
	{
		this.setState
		({
			turn_off : false
		})
	}
}

// {/* Change password popup */}
@international
@connect
(
	({ user_settings }) =>
	({
		...connector(user_settings.change_password)
	})
)
class Change_password_popup extends Component
{
	componentWillReceiveProps(new_props)
	{
		const { password_set } = this.props

		// If a password was either set or unset
		if (new_props.password_set !== password_set)
		{
			// Component will be unmounted shortly afterwards
			this.frozen = true
		}
	}

	componentWillUnmount()
	{
		const { reset } = this.props

		reset()
	}

	render()
	{
		const
		{
			password_set,
			turn_off,
			translate
		}
		= this.props

		if (this.frozen)
		{
			return this.snapshot
		}

		const markup =
		(
			<div className="compact">
				<h2>
					{ password_set ? (turn_off ? translate(messages.unset_password) : translate(messages.change_password)) : translate(messages.set_password) }
				</h2>

				{/* Change password steps */}
				<Steps done={ this.finished }>

					{/* Enter current password */}
					{ password_set &&
						<Step
							key="current"
							component={ Enter_current_password }
							turn_off={ turn_off }/>
					}

					{/* Enter new password */}
					{ !turn_off &&
						<Step
							key="new"
							component={ Enter_new_password }/>
					}

					{/* Enter new password again */}
					{ !turn_off &&
						<Step
							key="new-again"
							component={ Enter_new_password_again }/>
					}
				</Steps>
			</div>
		)

		return this.snapshot = markup
	}

	finished = () =>
	{
		const
		{
			close
		}
		= this.props

		close(true)
	}
}

// Enter current password
@Redux_form
@international
@connect
(
	({ user_settings }) =>
	({
		...connector(user_settings.change_password)
	}),
	{
		check_current_password,
		reset_check_current_password_error,
		change_password,
		reset_change_password_error,
		snack,
		get_user_authentication
	}
)
class Enter_current_password extends Component
{
	constructor()
	{
		super()

		this.submit = this.submit.bind(this)
	}

	componentWillUnmount()
	{
		this.reset_errors()
	}

	render()
	{
		const
		{
			check_current_password_pending,
			check_current_password_error,
			reset_check_current_password_error,
			change_password_pending,
			change_password_error,
			reset_change_password_error,
			submit,
			submitButton,
			translate
		}
		= this.props

		const markup =
		(
			<Form
				busy={ check_current_password_pending || change_password_pending }
				submit={ submit(this.reset_errors, this.submit) }
				error={ this.get_error() && !this.password_error(this.get_error()) && this.error(this.get_error()) }>

				<p className="rrui__form__field-description">
					{ translate(messages.enter_current_password) }
				</p>

				<TextInput
					password
					name="password"
					placeholder={ translate(messages.current_password) }
					error={ this.get_error() && this.password_error(this.get_error()) }
					validate={ this.validate_password }/>

				<Form.Actions>
					{ submitButton }
				</Form.Actions>
			</Form>
		)

		return markup
	}

	reset_errors = () =>
	{
		const
		{
			reset_check_current_password_error,
			reset_change_password_error
		}
		= this.props

		reset_check_current_password_error()
		reset_change_password_error()
	}

	get_error = () =>
	{
		const
		{
			check_current_password_error,
			change_password_error
		}
		= this.props

		return check_current_password_error || change_password_error
	}

	async submit({ password })
	{
		const
		{
			turn_off,
			get_user_authentication,
			change_password,
			check_current_password,
			next,
			finish,
			state,
			clear,
			focus,
			snack,
			translate
		}
		= this.props

		try
		{
			// Check current password
			await check_current_password(password)

			if (!turn_off)
			{
				// The current password matches, proceed to the next step
				return next({ ...state, old_password: password })
			}

			// Turn off the password
			await change_password
			({
				old_password : password
			})

			// Notify the user
			snack(translate(messages.password_unset))

			// Refresh password status
			await get_user_authentication()

			// Finished
			finish()
		}
		catch (error)
		{
			// Since Promise errors are swallowed
			console.error(error)

			// Swallows Http errors and Rest Api errors
			// so that they're not output to the console
			if (!error.status)
			{
				throw error
			}

			// Focus password input field on wrong password
			if (error.status === http_status_codes.Input_rejected && error.field === 'password')
			{
				clear('password', this.validate_password())
				focus()
			}
		}
	}

	validate_password = (value) =>
	{
		const { translate } = this.props

		if (!value)
		{
			return translate(messages.password_is_required)
		}
	}

	password_error = (error) =>
	{
		const { translate } = this.props

		// Don't show "Password required" when it's deliberately being reset
		// due to "Wrong password" error.
		if (error.status === http_status_codes.Input_rejected && error.field === 'password')
		{
			return translate(password_authentication_messages.wrong_password)
		}
	}

	error = (error) =>
	{
		const { translate } = this.props

		return translate(messages.check_current_password_failed)
	}
}

// Enter new password
@Redux_form
@international
class Enter_new_password extends Component
{
	constructor()
	{
		super()

		this.submit = this.submit.bind(this)
	}

	render()
	{
		const
		{
			submit,
			submitButton,
			translate
		}
		= this.props

		const markup =
		(
			<Form
				submit={ submit(this.submit) }>

				<p className="rrui__form__field-description">
					{ translate(messages.enter_new_password) }
				</p>

				<TextInput
					password
					name="password"
					placeholder={ translate(messages.new_password) }
					validate={ this.validate_password }/>

				<Form.Actions>
					{ submitButton }
				</Form.Actions>
			</Form>
		)

		return markup
	}

	async submit({ password })
	{
		try
		{
			const { next, state } = this.props

			next({ ...state, new_password: password })
		}
		catch (error)
		{
			// Since Promise errors are swallowed
			console.error(error)
			throw error
		}
	}

	validate_password = (value) =>
	{
		const { translate } = this.props

		if (!value)
		{
			return translate(messages.password_is_required)
		}
	}
}

// Enter new password again
@Redux_form
@international
@connect
(
	({ user_settings }) =>
	({
		...connector(user_settings.change_password)
	}),
	{
		get_user_authentication,
		change_password,
		reset_change_password_error,
		snack
	}
)
class Enter_new_password_again extends Component
{
	state = {}

	constructor()
	{
		super()

		this.submit = this.submit.bind(this)
	}

	componentWillUnmount()
	{
		this.reset_error()
	}

	render()
	{
		const
		{
			change_password_pending,
			change_password_error,
			submit,
			submitButton,
			translate
		}
		= this.props

		const
		{
			error
		}
		= this.state

		const markup =
		(
			<Form
				busy={ change_password_pending }
				submit={ submit(this.reset_error, this.submit) }
				error={ change_password_error && this.error(change_password_error) }>

				<p className="rrui__form__field-description">
					{ translate(messages.enter_new_password_again) }
				</p>

				<TextInput
					password
					name="password"
					placeholder={ translate(messages.new_password) }
					error={ error }
					validate={ this.validate_password }/>

				<Form.Actions>
					{ submitButton }
				</Form.Actions>
			</Form>
		)

		return markup
	}

	async submit({ password })
	{
		const
		{
			change_password,
			get_user_authentication,
			finish,
			state,
			focus,
			snack,
			translate
		}
		= this.props

		try
		{
			// If the new password is misspelled,
			// then reset the input field
			// and show "Password misspelled" error instead of "Missing input"
			if (password !== state.new_password)
			{
				// Makes sure the error change listener is triggered
				// (e.g. when it's being misspelled the second time)
				return this.setState({ value: '', error: undefined }, () =>
				{
					this.setState({ value: '', error: translate(messages.new_password_misspelled) })
					focus()
				})
			}

			// Change password
			await change_password
			({
				old_password : state.old_password,
				new_password : state.new_password
			})

			// Notify the user
			if (state.old_password)
			{
				snack(translate(messages.password_updated))
			}
			else
			{
				snack(translate(messages.password_set))
			}

			// Refresh password status
			await get_user_authentication()

			// Finished
			finish()
		}
		catch (error)
		{
			// Since Promise errors are swallowed
			console.error(error)
			throw error
		}
	}

	validate_password = (value) =>
	{
		const { translate } = this.props

		if (!value)
		{
			return translate(messages.password_is_required)
		}
	}

	error = (error) =>
	{
		const { translate } = this.props

		return translate(messages.change_password_failed)
	}

	// Reset form error before running form field validation
	reset_error = () =>
	{
		const { reset_change_password_error } = this.props

		this.setState({ error: undefined })
		reset_change_password_error()
	}
}

export const messages = defineMessages
({
	change_password:
	{
		id             : 'user.settings.password.change',
		description    : `Change user's own password popup title`,
		defaultMessage : `Change password`
	},
	set_password:
	{
		id             : 'user.settings.password.set',
		description    : `Set user's own password popup title`,
		defaultMessage : `Set up a password`
	},
	unset_password:
	{
		id             : 'user.settings.password.unset',
		description    : `Turn off user's own password popup title`,
		defaultMessage : `Disable the password`
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
		description    : `An invitation for a user to enter the new password again`,
		defaultMessage : `Enter the new password again`
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
	password_set:
	{
		id             : 'user.settings.password.password_set',
		description    : `User's password has been set`,
		defaultMessage : `Password set`
	},
	password_unset:
	{
		id             : 'user.settings.password.password_unset',
		description    : `User's password has been disabled`,
		defaultMessage : `Password disabled`
	},
	password_updated:
	{
		id             : 'user.settings.password.password_updated',
		description    : `User's new password has been saved`,
		defaultMessage : `Password updated`
	}
})