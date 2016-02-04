import React, { Component, PropTypes } from 'react'
import { PropTypes as React_router_prop_types } from 'react-router'

import { connect } from 'react-redux'
import styler      from 'react-styling'

import { defineMessages } from 'react-intl'
import international from '../internationalize'

import Uri from '../tools/uri'

import Text_input from './text input'
import Checkbox   from './checkbox'
import Button     from './button'
import Form       from './form'
import Modal      from './modal'

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
	},
	registration_name_is_required:
	{
		id             : 'registration.name_is_required',
		description    : 'Name field value can\'t be empty',
		defaultMessage : 'Choose a user name'
	},
	registration_email_is_required:
	{
		id             : 'registration.email_is_required',
		description    : 'Email field value can\'t be empty',
		defaultMessage : 'Your email address is required'
	},
	registration_password_is_required:
	{
		id             : 'registration.password_is_required',
		description    : 'Password field value can\'t be empty',
		defaultMessage : 'Choose a password'
	},
	registration_terms_of_service_acceptance_is_required:
	{
		id             : 'registration.terms_of_service_acceptance_is_required',
		description    : 'Terms of service acceptance checkbox must be checked',
		defaultMessage : 'You must agree to our terms of service in order to create an account'
	},
	authentication_email_is_required:
	{
		id             : 'authentication.email_is_required',
		description    : 'Email field value can\'t be empty',
		defaultMessage : 'Enter your email address'
	},
	authentication_password_is_required:
	{
		id             : 'authentication.password_is_required',
		description    : 'Password field value can\'t be empty',
		defaultMessage : 'Enter your password'
	},
	user_not_found:
	{
		id             : 'authentication.user_not_found',
		description    : 'Email not found in the database',
		defaultMessage : 'User with this email doesn\'t exist'
	},
	wrong_password:
	{
		id             : 'authentication.wrong_password',
		description    : 'Passowrd doesn\'t match the one in the database',
		defaultMessage : 'Wrong password'
	},
	email_already_registered:
	{
		id             : 'registration.email_already_registered',
		description    : 'User with this email address is already registered',
		defaultMessage : 'There already is a user account associated with this email address'
	}
})

@connect
(
	model => 
	({
		sign_in_error      : model.authentication.sign_in_error,
		registration_error : model.authentication.registration_error,

		registering   : model.authentication.registering,
		siging_in     : model.authentication.siging_in
	}),
	dispatch =>
	{
		const result = bind_action_creators
		({
			sign_in,
			register
		},
		dispatch)

		result.dispatch = dispatch

		return result
	}
)
@international()
export default class Authentication extends Component
{
	state = 
	{
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
		user               : PropTypes.object,

		signing_in         : PropTypes.bool,
		registering        : PropTypes.bool,

		sign_in_error      : PropTypes.object,
		registration_error : PropTypes.object,

		style              : PropTypes.object,
		on_sign_in         : PropTypes.func,

		sign_in            : PropTypes.func.isRequired,
		register           : PropTypes.func.isRequired
	}

	constructor(properties)
	{
		super(properties)

		extend(this.state, this.pristine_form_state)
	}

	componentDidMount()
	{
		setTimeout(() =>
		{
			// if the page hasn't been switched yet
			if (this.refs.email)
			{
				this.focus()
			}
		}, 
		0)
	}

	render()
	{
		return this.state.register ? this.render_registration_form() : this.render_sign_in_form()
	}

	render_sign_in_form()
	{
		const markup = 
		(
			<Form 
				ref="form" 
				className="authentication-form" 
				style={this.props.style ? merge(style.form, this.props.style) : style.form} 
				action={::this.sign_in} inputs={() => [this.refs.email, this.refs.password]} 
				error={this.props.sign_in_error && this.sign_in_error(this.props.sign_in_error)}>

				<h2 style={style.form_title}>{this.translate(messages.sign_in)}</h2>

				<div style={style.or_register} className="or-register">
					<span>{this.translate(messages.or)}&nbsp;</span>
					<Button button_style={style.or_register.register} action={::this.start_registration}>{this.translate(messages.register)}</Button>
				</div>

				<div style={style.clearfix}></div>

				<Text_input
					ref="email"
					email={false}
					value={this.state.email}
					validate={::this.validate_email_on_sign_in}
					on_change={value => this.setState({ email: value })}
					placeholder={this.translate(messages.email)}
					style={style.input}/>

				<Text_input
					ref="password"
					password={true}
					value={this.state.password}
					validate={::this.validate_password_on_sign_in}
					on_change={value => this.setState({ password: value })}
					placeholder={this.translate(messages.password)}
					style={style.input}/>

				<div style={style.sign_in_buttons}>
					<Button className="secondary" style={style.forgot_password} action={::this.forgot_password}>{this.translate(messages.forgot_password)}</Button>

					<Button style={style.form_action} submit={true} busy={this.props.signing_in}>{this.translate(messages.sign_in)}</Button>
				</div>
			</Form>
		)

		return markup
	}

	render_registration_form()
	{
		const markup = 
		(
			<Form 
				ref="form" 
				className="registration-form" 
				style={this.props.style ? merge(style.form, this.props.style) : style.form} 
				action={::this.register} 
				inputs={() => [this.refs.name, this.refs.email, this.refs.password, this.refs.accept_terms_of_service]} 
				error={this.props.registration_error && this.registration_error(this.props.registration_error)}>

				<h2 style={style.form_title}>{this.translate(messages.register)}</h2>

				<div style={style.or_register} className="or-register">
					<span>{this.translate(messages.or)}&nbsp;</span>
					<Button button_style={style.or_register.register} action={::this.cancel_registration}>{this.translate(messages.sign_in)}</Button>
				</div>

				<div style={style.clearfix}></div>

				<Text_input
					ref="name"
					value={this.state.name}
					validate={::this.validate_name_on_registration}
					on_change={value => this.setState({ name: value })}
					placeholder={this.translate(messages.name)}
					style={style.input}/>

				<Text_input
					ref="email"
					email={false}
					value={this.state.email}
					validate={::this.validate_email_on_registration}
					on_change={value => this.setState({ email: value })}
					placeholder={this.translate(messages.email)}
					style={style.input}/>

				<Text_input
					ref="password"
					password={true}
					value={this.state.password}
					validate={::this.validate_password_on_registration}
					on_change={value => this.setState({ password: value })}
					placeholder={this.translate(messages.password)}
					style={style.input}/>

				<div>
					<Checkbox
						ref="accept_terms_of_service"
						style={style.terms_of_service}
						value={this.state.terms_of_service_accepted}
						on_change={::this.accept_terms_of_service}
						validate={::this.validate_terms_of_service}>

						{this.translate(messages.i_accept)}

						&nbsp;<a target="_blank" href="https://www.dropbox.com/terms">{this.translate(messages.the_terms_of_service)}</a>
					</Checkbox>
				</div>

				<Button submit={true} style={style.form_action.register} busy={this.props.signing_in || this.props.registering}>{this.translate(messages.register)}</Button>
			</Form>
		)

		return markup
	}

	translate(message)
	{
		return this.props.translate(message)
	}

	focus()
	{
		this.refs.email.focus()
	}

	validate_email_on_sign_in(value)
	{
		if (!value)
		{
			return this.translate(messages.authentication_email_is_required)
		}
	}

	validate_password_on_sign_in(value)
	{
		if (!value)
		{
			return this.translate(messages.authentication_password_is_required)
		}
	}

	validate_name_on_registration(value)
	{
		if (!value)
		{
			return this.translate(messages.registration_name_is_required)
		}
	}

	validate_email_on_registration(value)
	{
		if (!value)
		{
			return this.translate(messages.registration_email_is_required)
		}
	}

	validate_password_on_registration(value)
	{
		if (!value)
		{
			return this.translate(messages.registration_password_is_required)
		}
	}

	validate_terms_of_service(value)
	{
		if (!value)
		{
			return this.translate(messages.registration_terms_of_service_acceptance_is_required)
		}
	}

	async sign_in()
	{
		try
		{
			await this.props.sign_in
			({
				email    : this.state.email,
				password : this.state.password
			})

			// a sane security measure
			this.setState({ password: undefined, show: false })

			if (this.props.on_sign_in)
			{
				this.props.on_sign_in()
			}
		}
		catch (error)
		{
			// swallows http errors
			if (!error.status)
			{
				throw error
			}
		}
	}

	forgot_password()
	{
		alert('To be done')
	}

	async register()
	{
		try
		{
			const result = await this.props.register
			({
				name     : this.state.name,
				email    : this.state.email,
				password : this.state.password
			})

			await this.sign_in()

			// this.cancel_registration()

			// // a sane security measure
			// this.setState({ password: undefined }, function()
			// {
			// 	this.refs.password.focus()
			// })
		}
		catch (error)
		{
			// swallows http errors
			if (!error.status)
			{
				throw error
			}
		}
	}

	sign_in_error(error)
	{
		if (error.status === 404)
		{
			return this.translate(messages.user_not_found)
		}
		else if (error.message === 'Wrong password')
		{
			return this.translate(messages.wrong_password)
		}

		return error
	}

	registration_error(error)
	{
		if (error.message === 'User is already registered for this email')
		{
			return this.translate(messages.email_already_registered)
		}

		return error
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
		this.props.dispatch({ type: 'reset user registration error' })

		this.reset_validation()

		this.setState({ register: true }, () =>
		{
			this.refs.name.focus()
		})
	}

	cancel_registration()
	{
		this.props.dispatch({ type: 'reset user sign in error' })

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
	form
		margin-left  : auto
		margin-right : auto

	form_title
		float : left
		margin-top : 0

	or_register
		float : right
		margin-top : 0.42em

		register
			text-transform : lowercase
			// font-weight: normal

	terms_of_service
		margin-top: 0.5em
		// margin-bottom: 1.2em

	forgot_password
		font-weight: normal

		float: left

	form_action

		text-align: right
		display: block

		&register
			margin-top: 1em
			// margin-bottom: 1em

	clearfix
		clear : both

	input
		margin-bottom : 1em

		input
			width : 100%

	sign_in_buttons
		margin-top: 1.5em
`