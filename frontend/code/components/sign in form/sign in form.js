import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { redirect } from 'react-isomorphic-render'
import { withRouter } from 'react-router'
import { ActivityIndicator } from 'react-responsive-ui'

import Register from './register'
import Sign_in from './sign in'
import Authenticate_with_access_code from '../authentication form/authenticate with access code'
import Authenticate_with_password from '../authentication form/authenticate with password'

import { should_redirect_to } from '../../helpers/redirection'
import international from '../../international/internationalize'
import { messages as user_bar_messages } from '../user bar'
import { messages as sign_in_messages } from './sign in'

import { preload_started, preload_finished } from '../../redux/preload'

import
{
	connector,
	sign_in_authenticated,
	reset_sign_in_authenticated_error
}
from '../../redux/authentication'

@connect
(
	state =>
	({
		...connector(state.authentication)
	}),
	{
		preload_started,
		sign_in_authenticated,
		reset_sign_in_authenticated_error
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

	start_registration = (email) =>
	{
		this.setState({ register: true, email })
	}

	finish_registration = () =>
	{
		this.setState({ register: false })
	}

	async sign_in()
	{
		const
		{
			authentication,
			sign_in_authenticated,
			open,
			close,
			preload_started,
			router:
			{
				location
			}
		}
		= this.props

		try
		{
			preload_started()

			// Hide the modal
			if (close)
			{
				close()
			}

			await sign_in_authenticated(authentication.id)

			// Signed in.
			// Refresh the page so that `authentication_token`
			// is applied to the `http` tool.

			// Redirect to the original destination
			// if got here due to not being authenticated, etc.
			if (location.pathname === '/unauthenticated'
				|| location.pathname === '/unauthorized'
				|| location.pathname === '/sign-in'
				|| location.pathname === '/register')
			{
				return window.location = should_redirect_to(location)
			}

			// Refresh the current page after login
			window.location = location.pathname + (location.search || '') + (location.hash || '')
		}
		catch (error)
		{
			preload_finished()

			// Show the modal
			if (open)
			{
				open()
			}
		}
	}

	sign_in_authenticated_error(error)
	{
		const { translate } = this.props

		if (!error)
		{
			return
		}

		return translate(sign_in_messages.sign_in_error)
	}

	componentWillUnmount()
	{
		const { reset_sign_in_authenticated_error } = this.props

		reset_sign_in_authenticated_error()
	}

	render()
	{
		const
		{
			sign_in_authenticated_pending,
			sign_in_authenticated_error
		}
		= this.props

		const markup =
		(
			<div className="sign-in-form">
				{ sign_in_authenticated_error &&
					<div className="rrui__form__error">
						{ this.sign_in_authenticated_error(sign_in_authenticated_error) }
					</div>
				}

				{ !sign_in_authenticated_pending && !sign_in_authenticated_error &&
					this.render_content()
				}
			</div>
		)

		return markup
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

		if (register)
		{
			return <Register
				email={ email }
				finish={ this.finish_registration }/>
		}

		if (authentication)
		{
			if (authentication.pending.find_by({ type: 'password' }))
			{
				return <Authenticate_with_password
					title={ translate(user_bar_messages.sign_in) }
					submitText={ translate(user_bar_messages.sign_in) }
					finished={ this.sign_in }/>
			}

			if (authentication.pending.find_by({ type: 'access code' }))
			{
				return <Authenticate_with_access_code
					title={ translate(user_bar_messages.sign_in) }
					submitText={ translate(user_bar_messages.sign_in) }
					finished={ this.sign_in }/>
			}
		}

		return <Sign_in start_registration={ this.start_registration }/>
	}
}