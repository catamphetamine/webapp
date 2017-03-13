import React, { Component, PropTypes } from 'react'
import { flat as styler }              from 'react-styling'
import classNames                      from 'classnames'
import { defineMessages }              from 'react-intl'
import { connect }                     from 'react-redux'
import { Modal }                       from 'react-responsive-ui'

import
{
	change_email,
	reset_change_email_error,
	change_email_request,
	reset_change_email_request_error,
	connector
}
from '../../redux/user/settings/main'

import
{
	get_self,
	connector as authentication_connector
}
from '../../redux/authentication'

import { snack } from '../../redux/snackbar'

import http_status_codes from '../../tools/http status codes'

import international from '../../international/internationalize'

import Editable_field from '../../components/editable field'
import Authenticate_with_access_code from '../../components/authentication form/authenticate with access code'

import default_messages from '../../components/messages'
import { messages as authentication_messages } from '../../components/sign in form/sign in'

@connect
(
	({ authentication, user_settings }) =>
	({
		...authentication_connector(authentication),
		...connector(user_settings.main)
	}),
	{
		change_email_request,
		reset_change_email_request_error
	}
)
@international
export default class Change_email extends Component
{
	state = {}

	constructor()
	{
		super()

		this.save_new_email = this.save_new_email.bind(this)
	}

	componentWillUnmount()
	{
		const { reset_change_email_request_error } = this.props

		reset_change_email_request_error()
	}

	render()
	{
		const
		{
			user,
			translate,
			change_email_request_pending,
			change_email_request_error,
			authenticate_pending,
			change_email_pending
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
				error={ change_email_request_error && translate(messages.email_update_failed) }
				label={ translate(authentication_messages.email) }
				emptyLabel={ translate(messages.email_not_set) }
				value={ new_email || user.email }
				validate={ this.validate_email }
				save={ this.save_new_email }
				editing={ changing_email }
				cancel={ this.cancel_change_email }>

				{/* Change email popup */}
				<Modal
					isOpen={ changing_email }
					close={ this.cancel_change_email }
					busy={ change_email_request_pending || authenticate_pending || change_email_pending }
					closeLabel={ translate(default_messages.cancel) }>

					<Change_email_popup
						close={ this.cancel_change_email }/>
				</Modal>
			</Editable_field>
		)

		return markup
	}

	validate_email = (value) =>
	{
		const { translate } = this.props

		if (!value)
		{
			return translate(messages.enter_new_email)
		}
	}

	cancel_change_email = () =>
	{
		this.setState
		({
			changing_email : false,
			new_email      : undefined
		})
	}

	async save_new_email(value)
	{
		const { user, change_email_request } = this.props

		try
		{
			if (value === user.email)
			{
				return
			}

			await change_email_request(value)

			this.setState
			({
				changing_email : true,
				new_email      : value
			})
		}
		catch (error)
		{
			console.error(error)
			throw error
		}
	}
}

@connect
(
	({ authentication, user_settings }) =>
	({
		...authentication_connector(authentication),
		...connector(user_settings.main)
	}),
	{
		change_email,
		reset_change_email_error,
		snack,
		get_self
	}
)
@international
class Change_email_popup extends Component
{
	constructor()
	{
		super()

		this.update_email = this.update_email.bind(this)
	}

	componentWillReceiveProps(new_props)
	{
		const { user } = this.props

		// If an email was updated
		if (new_props.user.email !== user.email)
		{
			// Component will be unmounted shortly afterwards
			this.frozen = true
		}
	}

	componentWillUnmount()
	{
		const { reset_change_email_error } = this.props

		reset_change_email_error()
	}

	render()
	{
		const
		{
			change_email_error
		}
		= this.props

		if (this.frozen)
		{
			return this.snapshot
		}

		return this.snapshot =
		(
			<div className="change-email-form compact">
				{ this.render_content() }

				{ change_email_error &&
					<div className="rrui__form__error">
						{ this.error(change_email_error) }
					</div>
				}
			</div>
		)
	}

	render_content()
	{
		const
		{
			authentication,
			translate
		}
		= this.props

		if (authentication && authentication.action === 'change email')
		{
			const authentication_submit_text = authentication.pending.length > 1 ? translate(default_messages.next) : translate(default_messages.done)

			return <Authenticate_with_access_code
				key={ authentication.pending.length > 1 ? 'old' : 'new' }
				title={ translate(messages.change_email) }
				description={ authentication.pending.length > 1 ? translate(messages.enter_access_code_for_current_email) : translate(messages.enter_access_code_for_new_email) }
				submitText={ authentication_submit_text }
				finished={ this.update_email }/>
		}
	}

	async update_email(password)
	{
		const
		{
			change_email,
			get_self,
			authentication,
			translate,
			snack,
			close
		}
		= this.props

		try
		{
			await change_email(authentication.id)

			await get_self()

			snack(translate(messages.email_updated))

			this.setState({ changing_email : false })

			if (close)
			{
				close()
			}
		}
		catch (error)
		{
			// snack(translate(messages.email_update_failed), 'error')
			console.error(error)

			this.frozen = false
			this.forceUpdate()

			throw error
		}
	}

	error(error)
	{
		const { translate } = this.props

		if (!error)
		{
			return
		}

		return translate(messages.email_update_failed)
	}
}

const messages = defineMessages
({
	change_email:
	{
		id             : 'user.settings.email.change_title',
		description    : `Check password popup title`,
		defaultMessage : `Security check`
	},
	email_not_set:
	{
		id             : 'user.settings.email.not_set',
		description    : `The user hasn't specified his email address`,
		defaultMessage : `not specified`
	},
	enter_access_code_for_current_email:
	{
		id             : 'user.settings.email.enter_access_code_for_current_email',
		description    : `An instruction for the user to enter the access code sent to his current mailbox`,
		defaultMessage : `Enter the access code from an email message you've just received (or gonna receive in a few moments) on your current mailbox`
	},
	enter_current_email:
	{
		id             : 'user.settings.email.enter_current_email',
		description    : `An error message stating that current email hasn't been entered`,
		defaultMessage : `Enter your current email`
	},
	enter_access_code_for_new_email:
	{
		id             : 'user.settings.email.enter_access_code_for_new_email',
		description    : `An instruction for the user to enter the access code sent to his new mailbox`,
		defaultMessage : `Enter the access code from an email message you've just received (or gonna receive in a few moments) on your new mailbox`
	},
	enter_new_email:
	{
		id             : 'user.settings.email.enter_new_email',
		description    : `An error message stating that new email hasn't been entered`,
		defaultMessage : `Enter new email`
	},
	email_updated:
	{
		id             : 'user.settings.email.updated',
		description    : `User's new email has been saved`,
		defaultMessage : `Email updated`
	},
	email_update_failed:
	{
		id             : 'user.settings.email.update_failed',
		description    : `An error stating that the user's email couldn't be changed to the new one`,
		defaultMessage : `Couldn't update your email`
	}
})