import React, { Component, PropTypes } from 'react'
import { title }                       from 'react-isomorphic-render'
import { connect }                     from 'react-redux'
import styler                          from 'react-styling'
import { defineMessages }              from 'react-intl'

import international from '../international/internationalize'

import Authentication_form from '../components/authentication form'

const messages = defineMessages
({
	header:
	{
		id             : 'register.header',
		description    : 'Registration page header',
		defaultMessage : 'Create an account'
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
			this.props.history.replace(this.props.location.query.request || '/')
		}
	}

	render()
	{
		const markup = 
		(
			<section className="content">
				{title("Register")}

				<Authentication_form registration={true} style={style.form} on_sign_in={() =>
				{
					this.props.history.replace(this.props.location.query.request || '/')
				}}/>
			</section>
		)

		return markup
	}
}

const style = styler
`
	header
		text-align: center

	form
		margin-top: 1.5em
`