import React, { Component, PropTypes } from 'react'
import { Title, redirect }             from 'react-isomorphic-render'
import { connect }                     from 'react-redux'
import styler                          from 'react-styling'
import { defineMessages }              from 'react-intl'
import { withRouter }                  from 'react-router'

import { should_redirect_to } from '../helpers/redirection'

import international from '../international/internationalize'

import http_status_codes from '../tools/http status codes'

import { messages as user_bar_messages } from '../components/user bar'
import Sign_in_form from '../components/sign in form/sign in form'

const messages = defineMessages
({
	user_with_email_not_found:
	{
		id             : 'sign_in.error.user_with_email_not_found',
		description    : 'When user with such email is not found in the database',
		defaultMessage : 'User with email "{email}" not found'
	}
})

@connect
(
	state =>
	({
		user : state.authentication.user,
		sign_in_pending : state.authentication.sign_in_pending,
	}),
	{
		redirect
	}
)
@international
@withRouter
export default class Sign_in extends Component
{
	constructor(props)
	{
		super(props)

		const
		{
			router:
			{
				location:
				{
					query:
					{
						email
					}
				}
			}
		}
		= props

		this.fields =
		{
			email
		}

		this.redirect = this.redirect.bind(this)
	}

	componentWillMount()
	{
		// при обновлении этой страницы (Ctrl + R),
		// если пользователь уже вошёл,
		// то автоматически перенаправлять на requested url.
		//
		if (this.props.user)
		{
			this.redirect()
		}
	}

	render()
	{
		const { email, sign_in_pending, translate } = this.props

		const markup =
		(
			<section className="content sign-in-page">
				<Title>{ translate(user_bar_messages.sign_in) }</Title>

				<Sign_in_form
					sign_in
					values={ this.fields }
					focus_on={ this.get_focused_element() }
					style={ style.form }
					error={ this.error_message() }/>
			</section>
		)

		return markup
	}

	error_message()
	{
		let
		{
			translate,
			router:
			{
				location:
				{
					query:
					{
						error,
						error_status
					}
				}
			}
		}
		= this.props

		error_status = parseInt(error_status)

		if (!error)
		{
			return
		}

		if (error === '"email" is required')
		{
			// return translate(authentication_form_messages.authentication_email_is_required)
		}

		if (error_status === http_status_codes.Not_found)
		{
			return translate(messages.user_with_email_not_found, { email: this.props.email })
		}

		if (error === 'Login attempts limit exceeded')
		{
			return translate(authentication_form_messages.authentication_attempts_limit_exceeded_error)
		}

		return error
	}

	get_focused_element()
	{
		let
		{
			translate,
			router:
			{
				location:
				{
					query:
					{
						error,
						error_status
					}
				}
			}
		}
		= this.props

		error_status = parseInt(error_status)

		if (error === '"email" is required')
		{
			return 'email'
		}

		if (error === '"password" is required')
		{
			return 'password'
		}

		if (error_status === http_status_codes.Not_found)
		{
			return 'email'
		}

		if (error_status === http_status_codes.Input_rejected)
		{
			return 'password'
		}

		return 'email'
	}

	redirect()
	{
		const { redirect, location } = this.props

		// Revisit current URL now being logged in
		redirect(should_redirect_to(location))
	}
}

const style = styler
`
	header
		text-align: center

	form
		margin-top    : 3rem
		margin-bottom : 3rem
		margin-left   : auto
		margin-right  : auto
`