import React, { Component, PropTypes } from 'react'
import { title }                       from 'react-isomorphic-render'
import { redirect }                    from 'react-isomorphic-render/redux'
import { connect }                     from 'react-redux'
import styler                          from 'react-styling'
import { defineMessages }              from 'react-intl'

import { should_redirect_to } from '../helpers/redirection'

import international from '../international/internationalize'

import http_status_codes from '../tools/http status codes'

import { messages as user_bar_messages }                           from '../components/user bar'
import Authentication_form, { messages as authentication_form_messages } from '../components/authentication form'

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
	model =>
	({
		user : model.authentication.user,

		sign_in_pending : model.authentication.sign_in_pending,

		error        : model.router.location.query.error,
		error_status : parseInt(model.router.location.query.error_status),
		email        : model.router.location.query.email
	})
)
@international()
export default class Sign_in extends Component
{
	constructor(props, context)
	{
		super(props, context)

		this.fields =
		{
			email : props.email
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
			<section className="content">
				{title(translate(user_bar_messages.sign_in))}

				<Authentication_form
					form_id="sign_in_page_form"
					busy={sign_in_pending}
					initial_values={this.fields}
					focus_on={this.get_focused_element()}
					style={style.form}
					error={this.error_message()}/>
			</section>
		)

		return markup
	}

	error_message()
	{
		const { error, error_status, translate } = this.props

		if (!error)
		{
			return
		}

		if (error === '"email" is required')
		{
			return translate(authentication_form_messages.authentication_email_is_required)
		}

		if (error === '"password" is required')
		{
			return translate(authentication_form_messages.authentication_password_is_required)
		}

		if (error_status === http_status_codes.Not_found)
		{
			return translate(messages.user_with_email_not_found, { email: this.props.email })
		}

		if (error_status === http_status_codes.Input_rejected)
		{
			return translate(authentication_form_messages.wrong_password)
		}

		if (error === 'Login attempts limit exceeded')
		{
			return translate(authentication_form_messages.login_attempts_limit_exceeded_error)
		}

		return error
	}

	get_focused_element()
	{
		const { error, error_status, translate } = this.props

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
		// Revisit current URL now being logged in
		this.props.dispatch(redirect(should_redirect_to(this.props.location)))
	}
}

const style = styler
`
	header
		text-align: center

	form
		margin-top    : 3rem
		margin-bottom : 3rem
`