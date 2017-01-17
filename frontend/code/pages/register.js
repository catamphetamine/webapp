import React, { Component, PropTypes } from 'react'
import { title, redirect }             from 'react-isomorphic-render'
import { connect }                     from 'react-redux'
import styler                          from 'react-styling'
import { defineMessages }              from 'react-intl'
import { withRouter }                  from 'react-router'

import { should_redirect_to } from '../helpers/redirection'

import international from '../international/internationalize'

import { messages as user_bar_messages } from '../components/user bar'
import Authentication_form, { messages as authentication_form_messages } from '../components/authentication form'

const messages = defineMessages
({
})

@connect
(
	state =>
	({
		user : state.authentication.user,
		registration_pending : state.authentication.registration_pending,
	})
)
@withRouter
@international()
export default class Register extends Component
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
						error,
						name,
						email,
						password,
						terms_of_service_accepted
					}
				}
			}
		}
		= props

		this.fields =
		{
			name,
			email,
			password,
			terms_of_service_accepted : exists(terms_of_service_accepted)
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
					values={this.fields}
					focus_on={this.get_focused_element()}
					style={style.form}
					error={this.error_message()}/>
			</section>
		)

		return markup
	}

	error_message()
	{
		const
		{
			translate,
			router:
			{
				location:
				{
					query:
					{
						error
					}
				}
			}
		}
		= this.props

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
		const
		{
			translate,
			router:
			{
				location:
				{
					query:
					{
						error
					}
				}
			}
		}
		= this.props

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