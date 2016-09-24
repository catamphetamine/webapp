import React, { Component, PropTypes } from 'react'
import { title }                       from 'react-isomorphic-render'
import { redirect }                    from 'react-isomorphic-render/redux'
import { connect }                     from 'react-redux'
import styler                          from 'react-styling'
import { defineMessages }              from 'react-intl'

import { should_redirect_to } from '../helpers/redirection'

import international from '../international/internationalize'

import { messages as user_bar_messages } from '../components/user bar'
import Authentication_form, { messages as authentication_form_messages } from '../components/authentication form'

const messages = defineMessages
({
})

@connect
(
	model =>
	({
		user : model.authentication.user,

		error        : model.router.location.query.error,
		// error_status : parseInt(model.router.location.query.error_status),

		registration_pending : model.authentication.registration_pending,

		name                      : model.router.location.query.name,
		email                     : model.router.location.query.email,
		password                  : model.router.location.query.password,
		terms_of_service_accepted : exists(model.router.location.query.terms_of_service_accepted)
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
			name                      : props.name,
			email                     : props.email,
			password                  : props.password,
			terms_of_service_accepted : props.terms_of_service_accepted
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
		const
		{
			name,
			email,
			password,
			accept,
			terms_of_service_accepted,
			registration_pending,
			translate
		}
		= this.props

		const markup =
		(
			<section className="content">
				{title(translate(user_bar_messages.register))}

				<Authentication_form
					register
					registration={true}
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
		const { error, translate } = this.props

		if (!error)
		{
			return
		}

		if (error === '"name" is required')
		{
			return translate(authentication_form_messages.registration_name_is_required)
		}

		if (error === '"email" is required')
		{
			return translate(authentication_form_messages.registration_email_is_required)
		}

		if (error === '"password" is required')
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
		const { error, translate } = this.props

		if (error === '"name" is required')
		{
			return 'name'
		}

		if (error === '"email" is required')
		{
			return 'email'
		}

		if (error === '"password" is required')
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
		margin-top    : 3rem
		margin-bottom : 3rem
`