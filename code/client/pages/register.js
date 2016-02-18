import React, { Component, PropTypes } from 'react'
import { title, redirect }             from 'react-isomorphic-render'
import { connect }                     from 'react-redux'
import styler                          from 'react-styling'
import { defineMessages }              from 'react-intl'

import { should_redirect_to } from '../helpers/redirection'

import international from '../international/internationalize'

import { messages as authentication_messages }                           from '../components/authentication'
import Authentication_form, { messages as authentication_form_messages } from '../components/authentication form'

const messages = defineMessages
({
})

@connect
(
	model =>
	({
		user : model.authentication.user,

		error      : model.router.location.query.error,
		error_code : model.router.location.query.error_code,

		name                      : model.router.location.query.name,
		email                     : model.router.location.query.email,
		password                  : model.router.location.query.password,
		terms_of_service_accepted : model.router.location.query.terms_of_service_accepted
	})
)
@international()
export default class Sign_in extends Component
{
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
		const { name, email, password, accept, terms_of_service_accepted } = this.props

		const markup = 
		(
			<section className="content">
				{title(this.props.translate(authentication_messages.register))}

				<Authentication_form 
					registration={true}
					fields={{ name, email, password, accept, terms_of_service_accepted }}
					focus_on={this.get_focused_element()}
					style={style.form} 
					on_sign_in={::this.redirect}/>

				{ this.props.error ? this.render_error() : null }
			</section>
		)

		return markup
	}

	render_error()
	{
		const markup =
		(
			<ul className="errors">
				<li>{this.error_message()}</li>
			</ul>
		)

		return markup
	}

	error_message()
	{
		const { error, error_code, translate } = this.props

		if (error === '"name" required')
		{
			return translate(authentication_form_messages.registration_name_is_required)
		}

		if (error === '"email" required')
		{
			return translate(authentication_form_messages.registration_email_is_required)
		}

		if (error === '"password" required')
		{
			return translate(authentication_form_messages.registration_password_is_required)
		}
		
		if (error === 'You must accept the terms of service')
		{
			return translate(authentication_form_messages.registration_terms_of_service_acceptance_is_required)
		}

		if (error === 'User is already registered for this email')
		{
			return translate(authentication_form_messages.email_already_registered)
		}

		return error
	}

	get_focused_element()
	{
		const { error, error_code, translate } = this.props

		if (error === '"name" required')
		{
			return 'name'
		}

		if (error === '"email" required')
		{
			return 'email'
		}

		if (error === '"password" required')
		{
			return 'password'
		}
		
		if (error === 'You must accept the terms of service')
		{
			return 'terms_of_service_accepted'
		}

		if (error === 'User is already registered for this email')
		{
			return 'email'
		}

		return 'email'
	}

	redirect()
	{
		this.props.dispatch(redirect(should_redirect_to(this.props.location)))
	}
}

const style = styler
`
	header
		text-align: center

	form
		margin-top: 1.5em
`