import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { redirect } from 'react-isomorphic-render'
import { withRouter } from 'react-router'
import { defineMessages } from 'react-intl'
import { ActivityIndicator } from 'react-responsive-ui'
import classNames from 'classnames'

import Register from './register'
import Sign_in from './sign in'
import Authenticate_with_access_code from '../authentication form/authenticate with access code'
import Authenticate_with_password from '../authentication form/authenticate with password'

import { get_redirect_url } from '../../helpers/redirection'
import international from '../../international/internationalize'
import { messages as user_bar_messages } from '../user bar'
import { messages as sign_in_messages } from './sign in'
import default_messages from '../messages'

import { preload_started, preload_finished } from '../../redux/preload'

import
{
	connector,
	sign_in,
	reset_sign_in_error
}
from '../../redux/authentication'

@connect
(
	({ authentication }) =>
	({
		...connector(authentication)
	}),
	{
		preload_started,
		preload_finished,
		sign_in,
		reset_sign_in_error
	}
)
@international
@withRouter
export default class Sign_in_form extends Component
{
	state = {}

	constructor()
	{
		super()

		this.sign_in = this.sign_in.bind(this)
	}

	componentWillUnmount()
	{
		const { reset_sign_in_error } = this.props

		reset_sign_in_error()
	}

	componentWillReceiveProps(new_props)
	{
		const { authentication } = this.props

		// When the user has authenticated
		if (authentication && authentication.action === 'sign in' &&
			new_props.authentication && new_props.authentication.action === 'sign in' &&
			authentication.pending.length > 0 && new_props.authentication.pending.length === 0)
		{
			// Component will be unmounted shortly afterwards
			this.frozen = true
		}
	}

	render()
	{
		const
		{
			sign_in_error,
			className,
			style
		}
		= this.props

		if (this.frozen)
		{
			return this.snapshot
		}

		return this.snapshot =
		(
			<div className={ classNames('sign-in-form', 'compact', className) } style={ style }>
				{ this.render_content() }

				{ sign_in_error &&
					<div className="rrui__form__error">
						{ this.error(sign_in_error) }
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

		const { email } = this.state

		const
		{
			register
		}
		= this.state

		const authentication_submit_text = authentication && authentication.pending.length > 1 ? translate(default_messages.next) : translate(default_messages.done)

		if (register)
		{
			return <Register
				email={ email }
				finish={ this.finish_registration }/>
		}

		if (authentication && authentication.action === 'sign in' && authentication.pending.not_empty())
		{
			if (authentication.pending[0].type === 'access code')
			{
				return <Authenticate_with_access_code
					title={ translate(user_bar_messages.sign_in) }
					submitText={ authentication_submit_text }
					finished={ this.sign_in }/>
			}

			if (authentication.pending[0].type === 'password')
			{
				return <Authenticate_with_password
					title={ translate(user_bar_messages.sign_in) }
					submitText={ authentication_submit_text }
					finished={ this.sign_in }/>
			}
		}

		return <Sign_in start_registration={ this.start_registration }/>
	}

	start_registration = (email) =>
	{
		this.setState({ register: true, email })
	}

	finish_registration = () =>
	{
		this.setState({ register: false, just_registered: true })
	}

	async sign_in()
	{
		const
		{
			authentication,
			sign_in,
			open,
			close,
			preload_started,
			preload_finished,
			router:
			{
				location
			}
		}
		= this.props

		const
		{
			just_registered
		}
		= this.state

		try
		{
			preload_started()

			const user = await sign_in(authentication.id)

			// Hide the modal
			// (if this form is displayed in a modal)
			if (close)
			{
				close()
			}

			// Signed in.
			// Refresh the page so that `access_token`
			// is applied to the `http` tool.

			if (just_registered)
			{
				return window.location = `/${user.poster.alias}`
			}

			// Redirect to the original destination
			// if got here due to not being authenticated, etc.
			if (location.pathname === '/unauthenticated'
				|| location.pathname === '/unauthorized'
				|| location.pathname === '/sign-in'
				|| location.pathname === '/register')
			{
				return window.location = get_redirect_url(location)
			}

			// Refresh the current page after login
			window.location = location.pathname + (location.search || '') + (location.hash || '')
		}
		catch (error)
		{
			preload_finished()

			this.frozen = false
			this.forceUpdate()
		}
	}

	error(error)
	{
		const { translate } = this.props

		if (!error)
		{
			return
		}

		return translate(messages.sign_in_failed)
	}
}

export const messages = defineMessages
({
	sign_in_failed:
	{
		id             : 'sign_in.error',
		description    : 'User sign in failed for some reason',
		defaultMessage : `Couldn't sign in`
	}
})