import React, { Component, PropTypes } from 'react'
import { title, redirect }             from 'react-isomorphic-render'
import { connect }                     from 'react-redux'
import styler                          from 'react-styling'
import { defineMessages }              from 'react-intl'

import { should_redirect_to } from '../tools/redirection'

import international from '../international/internationalize'

import Authentication_form from '../components/authentication form'

const messages = defineMessages
({
	header:
	{
		id             : 'sign_in.header',
		description    : 'Sign in page header',
		defaultMessage : 'Sign in'
	}
})

@connect
(
	model => ({ user: model.authentication.user })
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
		const markup = 
		(
			<section className="content">
				{title("Sign in")}

				<Authentication_form style={style.form} on_sign_in={::this.redirect}/>
			</section>
		)

		return markup
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