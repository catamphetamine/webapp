import React, { Component, PropTypes } from 'react'
import { PropTypes as React_router_prop_types } from 'react-router'

import { connect } from 'react-redux'

import styler from 'react-styling'

import { defineMessages } from 'react-intl'
import international from '../internationalize'

import Uri from '../tools/uri'

import Checkbox from './checkbox'
import Modal from 'react-modal'

const messages = defineMessages
({
	sign_in:
	{
		id             : 'authentication.sign_in',
		description    : 'Log in action',
		defaultMessage : 'Sign in'
	},
	or:
	{
		id             : 'authentication.sign_in_or_register',
		description    : 'Sign in or register',
		defaultMessage : 'or'
	},
	register:
	{
		id             : 'authentication.register',
		description    : 'Register action',
		defaultMessage : 'Create an account'
	},
	email:
	{
		id             : 'authentication.email',
		description    : 'Email',
		defaultMessage : 'Email'
	},
	password:
	{
		id             : 'authentication.password',
		description    : 'Password',
		defaultMessage : 'Password'
	},
	forgot_password:
	{
		id             : 'authentication.forgot_password',
		description    : 'Forgot password?',
		defaultMessage : 'Forgot password?'
	},
	i_accept:
	{
		id             : 'registration.i_accept',
		description    : 'I agree to',
		defaultMessage : 'I agree to'
	},
	the_terms_of_service:
	{
		id             : 'registration.the_terms_of_service',
		description    : 'the terms of service',
		defaultMessage : 'the terms of service'
	}
})

@connect
(
	store => 
	({
		user : store.authentication.user
	})
)
@international()
export default class Authentication extends Component
{
	state = 
	{
		show_sign_in_form : false,
		register : false
	}

	static propTypes =
	{
		user: PropTypes.object
	}

	render()
	{
		const translate = this.props.intl.formatMessage

		const { user } = this.props

		const markup =
		(
			<div className="authentication" style={ this.props.style ? extend({ display: 'inline-block' }, this.props.style) : { display: 'inline-block' } }>
				
				{/* Sign in action */}
				{ !user ? <button onClick={::this.show_sign_in_form}>{translate(messages.sign_in)}</button> : null }

				{/* Register action */}
				{/* <button>translate(messages.register)</button> */}

				{/* User info if authenticated */}
				{ user ? this.render_user_info(user) : null }

				<Modal
					isOpen={this.state.show_sign_in_form}
					onRequestClose={::this.hide_sign_in_form}
					// closeTimeoutMS={1000}
					style={style.modal}>

					{ this.state.register ? this.render_registration_form() : this.render_sign_in_form() }
				</Modal>
			</div>
		)

		return markup
	}

	render_registration_form()
	{
		const translate = this.props.intl.formatMessage

		const markup = 
		(
			<form className="ac-custom" style={style.form} onSubmit={ event => event.preventDefault() }>
				<h2 style={style.form_title}>{translate(messages.register)}</h2>

				<div style={style.or_register}>
					<span>{translate(messages.or)}&nbsp;</span>
					<button style={style.or_register.register} onClick={::this.cancel_registration}>{translate(messages.sign_in)}</button>
				</div>

				<div style={style.clearfix}></div>

				<input type="text" placeholder={translate(messages.email)} style={style.input}/>

				<input type="text" placeholder={translate(messages.password)} style={style.input}/>

				<div>
					<Checkbox style={style.terms_of_service} checked={this.state.terms_of_service_accepted} on_change={::this.accept_terms_of_service} label={translate(messages.i_accept)}/>

					&nbsp;<a target="_blank" href="https://www.dropbox.com/terms">{translate(messages.the_terms_of_service)}</a>
				</div>

				<button style={style.form_action} onClick={::this.register}>{translate(messages.register)}</button>
			</form>
		)

		return markup
	}

	render_sign_in_form()
	{
		const translate = this.props.intl.formatMessage

		const markup = 
		(
			<form style={style.form} onSubmit={ event => event.preventDefault() }>
				<h2 style={style.form_title}>{translate(messages.sign_in)}</h2>

				<div style={style.or_register}>
					<span>{translate(messages.or)}&nbsp;</span>
					<button style={style.or_register.register} onClick={::this.start_registration}>{translate(messages.register)}</button>
				</div>

				<div style={style.clearfix}></div>

				<input type="text" placeholder={translate(messages.email)} style={style.input}/>

				<input type="text" placeholder={translate(messages.password)} style={style.input}/>

				<button style={style.forgot_password} onClick={::this.forgot_password}>{translate(messages.forgot_password)}</button>

				<button style={style.form_action} onClick={::this.sign_in}>{translate(messages.sign_in)}</button>
			</form>
		)

		return markup
	}

	render_user_info(user)
	{
		const markup = 
		(
			<div>
				{/* Username */}
				<div className="username">{user.username}</div>

				{/* Avatar */}
				<div className="user_picture" style={{ backgroundImage: 'url(/upload/user_pictures/' + user.id + '.jpg)' }}></div>
			</div>
		)

		return markup
	}

	show_sign_in_form()
	{
		this.setState({ show_sign_in_form: true })
	}

	hide_sign_in_form()
	{
		this.setState({ show_sign_in_form: false, register: false })
	}

	sign_in()
	{
		alert('to be done')
	}

	forgot_password()
	{
		alert('to be done')
	}

	register()
	{
		alert('to be done')
	}

	start_registration()
	{
		this.setState({ register: true })
	}

	cancel_registration()
	{
		this.setState({ register: false })
	}

	accept_terms_of_service(value)
	{
		this.setState({ terms_of_service_accepted: value })
	}
}

const style = styler
`
	modal
		overlay
			background-color: rgba(0, 0, 0, 0.2)

		content
			// top    : 1.5em
			// left   : 1.5em
			// right  : 1.5em
			// bottom : 1.5em

			padding-left  : 2em
			padding-right : 2em

			padding-top    : 1.5em
			padding-bottom : 1.5em

			top                   : 50%
			left                  : 50%
			right                 : auto
			bottom                : auto
			margin-right          : -50%
			transform             : translate(-50%, -50%)

	form
		width : 25em

	form_title
		float : left
		margin-top : 0

	or_register
		float : right
		margin-top : 0.4em

		register
			text-transform : lowercase
			font-weight: normal

	terms_of_service
		margin-top: 0.5em
		margin-bottom: 1.2em

	forgot_password
		font-weight: normal

	form_action
		float: right

	clearfix
		clear : both

	input
		width : 100%
		margin-bottom: 1em
`