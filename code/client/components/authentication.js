import React, { Component, PropTypes } from 'react'
// import ReactDOM from 'react-dom'
import { PropTypes as React_router_prop_types } from 'react-router'

import { connect } from 'react-redux'

import styler from 'react-styling'

import { defineMessages } from 'react-intl'
import international from '../internationalize'

import Uri from '../tools/uri'

import Text_input from './text input'
import Checkbox   from './checkbox'
import Modal from 'react-modal'

import { bindActionCreators as bind_action_creators } from 'redux'
import { sign_in, register } from '../actions/authentication'

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
	name:
	{
		id             : 'authentication.name',
		description    : 'User name',
		defaultMessage : 'Name'
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
	}),
	dispatch => bind_action_creators
	({
		sign_in,
		register
	},
	dispatch)
)
@international()
export default class Authentication extends Component
{
	state = 
	{
		show : false
	}

	pristine_form_state = 
	{
		name     : undefined,
		email    : undefined,
		password : undefined,
		register : false
	}

	static propTypes =
	{
		user: PropTypes.object,

		sign_in     : PropTypes.func.isRequired,
		register    : PropTypes.func.isRequired
	}

	constructor(properties)
	{
		super(properties)

		extend(this.state, this.pristine_form_state)
	}

	componentDidMount()
	{
		this.mounted = true
	}

	render()
	{
		const translate = this.props.intl.formatMessage

		const { user } = this.props

		const markup =
		(
			<div className="authentication" style={ this.props.style ? extend({ display: 'inline-block' }, this.props.style) : { display: 'inline-block' } }>
				
				{/* Sign in action */}
				{ !user ? <button className="sign_in" onClick={::this.show}>{translate(messages.sign_in)}</button> : null }

				{/* Register action */}
				{/* <button>translate(messages.register)</button> */}

				{/* User info if authenticated */}
				{ user ? this.render_user_info(user) : null }

				<Modal
					isOpen={exists(this.state.password) || (!user && this.state.show)}
					onRequestClose={::this.hide}
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
			<form style={style.form} onSubmit={::this.register}>
				<h2 style={style.form_title}>{translate(messages.register)}</h2>

				<div style={style.or_register}>
					<span>{translate(messages.or)}&nbsp;</span>
					<button type="button" style={style.or_register.register} onClick={::this.cancel_registration}>{translate(messages.sign_in)}</button>
				</div>

				<div style={style.clearfix}></div>

				<Text_input
					ref="name"
					value={this.state.name}
					validate={::this.validate_name}
					on_change={value => this.setState({ name: value })}
					placeholder={translate(messages.name)}
					on_enter={::this.register}
					style={style.input}/>

				<Text_input
					ref="email"
					email={false}
					value={this.state.email}
					validate={::this.validate_email}
					on_change={value => this.setState({ email: value })}
					placeholder={translate(messages.email)}
					on_enter={::this.register}
					style={style.input}/>

				<Text_input
					ref="password"
					password={true}
					value={this.state.password}
					validate={::this.validate_password}
					on_change={value => this.setState({ password: value })}
					placeholder={translate(messages.password)}
					on_enter={::this.register}
					style={style.input}/>

				<div>
					<Checkbox
						ref="accept_terms_of_service"
						style={style.terms_of_service}
						value={this.state.terms_of_service_accepted}
						on_change={::this.accept_terms_of_service}
						validate={::this.validate_terms_of_service}
						label={translate(messages.i_accept)}/>

					&nbsp;<a target="_blank" href="https://www.dropbox.com/terms">{translate(messages.the_terms_of_service)}</a>
				</div>

				<button type="submit" style={style.form_action}>{translate(messages.register)}</button>
			</form>
		)

		return markup
	}

	render_sign_in_form()
	{
		const translate = this.props.intl.formatMessage

		const markup = 
		(
			<form style={style.form} onSubmit={::this.sign_in}>
				<h2 style={style.form_title}>{translate(messages.sign_in)}</h2>

				<div style={style.or_register}>
					<span>{translate(messages.or)}&nbsp;</span>
					<button type="button" style={style.or_register.register} onClick={::this.start_registration}>{translate(messages.register)}</button>
				</div>

				<div style={style.clearfix}></div>

				<Text_input
					ref="email"
					email={false}
					value={this.state.email}
					validate={::this.validate_email}
					on_change={value => this.setState({ email: value })}
					placeholder={translate(messages.email)}
					on_enter={::this.sign_in}
					style={style.input}/>

				<Text_input
					ref="password"
					password={true}
					value={this.state.password}
					validate={::this.validate_password}
					on_change={value => this.setState({ password: value })}
					placeholder={translate(messages.password)}
					on_enter={::this.sign_in}
					style={style.input}/>

				<div style={style.sign_in_buttons}>
					<button type="button" className="secondary" style={style.forgot_password} onClick={::this.forgot_password}>{translate(messages.forgot_password)}</button>

					<button style={style.form_action} type="submit">{translate(messages.sign_in)}</button>
				</div>
			</form>
		)

		return markup
	}

	render_user_info(user)
	{
		const user_picture = user.picture ? `/upload/user_pictures/${user.id}.jpg` : require('../../../assets/images/no user picture 85x85.png')

		const markup = 
		(
			<div className="user_info">
				{/* Username */}
				<div className="user_name"><a href="/">{user.name}</a></div>

				{/* Avatar */}
				{/*<div className="user_picture" style={{ backgroundImage: `url("${user_picture}")` }}></div>*/}
				{/* the wrapping <div/> keeps image aspect ratio */}
				<div className="user_picture">
					<img src={user_picture}/>
				</div>
			</div>
		)

		return markup
	}

	show()
	{
		this.setState({ show: true }, () =>
		{
			this.refs.email.focus()
		})
	}

	hide()
	{
		this.setState({ show: false, ...this.pristine_form_state })
	}

	validate_name(value)
	{
		return value
	}

	validate_email(value)
	{
		return value
	}

	validate_password(value)
	{
		return value
	}

	validate_terms_of_service(value)
	{
		return value
	}

	async sign_in(event)
	{
		event.preventDefault()

		if (!this.validate_email(this.state.email))
		{
			return this.refs.email.focus({ preserve_validation : true })
		}

		if (!this.validate_password(this.state.password))
		{
			return this.refs.password.focus({ preserve_validation : true })
		}

		try
		{
			await this.props.sign_in
			({
				email    : this.state.email,
				password : this.state.password
			})

			// a sane security measure
			this.setState({ password: undefined })
		}
		catch (error)
		{
			alert('User sign in failed.' + '\n\n' + error)
			console.log(error)
		}
	}

	forgot_password()
	{
		alert('to be done')
	}

	async register(event)
	{
		event.preventDefault()
		
		if (!this.validate_name(this.state.name))
		{
			return this.refs.name.focus({ preserve_validation : true })
		}

		if (!this.validate_email(this.state.email))
		{
			return this.refs.email.focus({ preserve_validation : true })
		}

		if (!this.validate_password(this.state.password))
		{
			return this.refs.password.focus({ preserve_validation : true })
		}

		if (!this.state.terms_of_service_accepted)
		{
			return this.refs.accept_terms_of_service.focus({ preserve_validation : true })
		}

		try
		{
			const result = await this.props.register
			({
				name     : this.state.name,
				email    : this.state.email,
				password : this.state.password
			})

			alert('User registered. Id ' + result.id)

			// a sane security measure
			this.setState({ password: undefined, register: false })
		}
		catch (error)
		{
			alert('User registration failed.' + '\n\n' + error)
			console.log(error)
		}
	}

	reset_validation()
	{
		if (this.refs.name)
		{
			this.refs.name.reset_validation()
		}

		this.refs.email.reset_validation()
		this.refs.password.reset_validation()

		if (this.refs.accept_terms_of_service)
		{
			this.refs.accept_terms_of_service.reset_validation()
		}
	}

	start_registration()
	{
		this.reset_validation()

		this.setState({ register: true }, () =>
		{
			this.refs.name.focus()
		})
	}

	cancel_registration()
	{
		this.reset_validation()

		this.setState({ register: false }, () =>
		{
			this.refs.email.focus()
		})
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
		margin-top : 0.42em

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

	sign_in_buttons
		margin-top: 1.5em
`