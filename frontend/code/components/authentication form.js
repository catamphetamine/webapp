import React, { Component, PropTypes } from 'react'

import { connect } from 'react-redux'
import styler      from 'react-styling'

import { redirect } from 'react-isomorphic-render/redux'

import { defineMessages } from 'react-intl'
import international from '../international/internationalize'

import Text_input             from './text input'
import Checkbox               from './checkbox'
import Button                 from './button'
import Form, { Form_actions } from './form'

import http_status_codes from '../tools/http status codes'

import { messages as user_bar_messages } from './user bar'

import { add_redirect, should_redirect_to, redirection_target } from '../helpers/redirection'

import { bindActionCreators as bind_action_creators } from 'redux'

import { sign_in, register } from '../actions/authentication'

export const messages = defineMessages
({
	or:
	{
		id             : 'authentication.sign_in_or_register',
		description    : 'Sign in or register',
		defaultMessage : 'or'
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
	},
	sign_in_error:
	{
		id             : 'authentication.error',
		description    : 'User sign in error',
		defaultMessage : 'Couldn\'t sign in'  
	},
	registration_error:
	{
		id             : 'registration.error',
		description    : 'User registration error',
		defaultMessage : 'Couldn\'t register'  
	},
	login_attempts_limit_exceeded_error:
	{
		id             : 'authentication.login_attempts_limit_exceeded_error',
		description    : `The user's login attempts limit has been reached. The user shold try again in 15 minutes or so.`,
		defaultMessage : 'Login attempts limit exceeded. Try again later.'  
	}
})

@connect
(
	model => 
	({
		sign_in_error      : model.authentication.sign_in_error,
		registration_error : model.authentication.registration_error,

		registering   : model.authentication.registering,
		siging_in     : model.authentication.siging_in,

		locale   : model.locale.locale,
		location : model.router.location
	}),
	dispatch =>
	({
		dispatch,
		...bind_action_creators
		({
			sign_in,
			register
		},
		dispatch)
	})
)
@international()
export default class Authentication extends Component
{
	state = 
	{
	}

	pristine_form_state = 
	{
		name                      : undefined,
		email                     : undefined,
		password                  : undefined,
		terms_of_service_accepted : undefined,

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
		register           : PropTypes.func.isRequired,

		registration       : PropTypes.bool,

		focus_on           : PropTypes.string,

		location           : PropTypes.object,

		fields             : PropTypes.object
	}

	constructor(properties)
	{
		super(properties)

		this.focus                             = this.focus.bind(this)
		this.set_name                          = this.set_name.bind(this)
		this.set_email                         = this.set_email.bind(this)
		this.set_password                      = this.set_password.bind(this)
		this.sign_in                           = this.sign_in.bind(this)
		this.start_registration                = this.start_registration.bind(this)
		this.forgot_password                   = this.forgot_password.bind(this)
		this.register                          = this.register.bind(this)
		this.cancel_registration               = this.cancel_registration.bind(this)
		this.accept_terms_of_service           = this.accept_terms_of_service.bind(this)
		this.validate_terms_of_service         = this.validate_terms_of_service.bind(this)

		extend(this.state, this.pristine_form_state)

		if (this.props.registration)
		{
			this.state.register = true
		}

		extend(this.state, this.props.fields)
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

	componentWillUnmount()
	{
		this.props.dispatch({ type: 'reset user sign in error' })
		this.props.dispatch({ type: 'reset user registration error' })
	}

	render()
	{
		return this.state.register ? this.render_registration_form() : this.render_sign_in_form()
	}

	render_sign_in_form()
	{
		const { translate, sign_in_error, error } = this.props

		const markup = 
		(
			<Form
				ref="form"
				className="authentication-form" 
				style={this.props.style ? { ...style.form, ...this.props.style } : style.form} 
				action={this.sign_in}
				focus={this.focus}
				error={error || this.sign_in_error(sign_in_error)}
				post="/authentication/legacy/sign-in">

				{/* "Sign in" */}
				<h2 style={style.form_title}>{translate(user_bar_messages.sign_in)}</h2>

				{/* "or register" */}
				<div style={style.or_register} className="or-register">
					<span>{translate(messages.or)}&nbsp;</span>
					<Button
						link={add_redirect('/register', this.props.location)} 
						button_style={style.or_register.register} 
						action={this.start_registration}>

						{translate(user_bar_messages.register)}
					</Button>
				</div>

				<div style={style.clearfix}></div>

				{/* "Email" */}
				<Text_input
					ref="email"
					name="email"
					email={true}
					focus={this.props.focus_on === 'email'}
					value={this.state.email}
					invalid={this.sign_in_email_error(sign_in_error) || this.validate_email(this.state.email)}
					on_change={this.set_email}
					label={translate(messages.email)}
					style={style.input}
					input_style={style.input.input}/>

				{/* "Password" */}
				<Text_input
					ref="password"
					name="password"
					password={true}
					focus={this.props.focus_on === 'password'}
					value={this.state.password}
					invalid={this.sign_in_password_error(sign_in_error) || this.validate_password_on_sign_in(this.state.password)}
					on_change={this.set_password}
					label={translate(messages.password)}
					style={style.input}
					input_style={style.input.input}/>

				{/* Support redirecting to the initial page when javascript is disabled */}
				<input type="hidden" name="request" value={should_redirect_to(this.props.location)}/>

				<Form_actions style={style.sign_in_buttons}>
					{/* "Forgot password" */}
					<Button
						style={style.forgot_password}
						action={this.forgot_password}>

						{translate(messages.forgot_password)}
					</Button>

					{/* "Sign in" button */}
					<Button
						style={style.form_action}
						submit={true}
						busy={this.props.signing_in}>

						{translate(user_bar_messages.sign_in)}
					</Button>
				</Form_actions>
			</Form>
		)

		return markup
	}

	render_registration_form()
	{
		const { translate, registration_error, error } = this.props

		const markup = 
		(
			<Form 
				ref="form"
				className="registration-form" 
				style={this.props.style ? { ...style.form, ...this.props.style } : style.form} 
				action={this.register} 
				focus={this.focus}
				error={error || this.registration_error(registration_error)}
				post="/authentication/legacy/register">

				{/* "Register" */}
				<h2 style={style.form_title}>{translate(user_bar_messages.register)}</h2>

				{/* "or sign in" */}
				<div style={style.or_register} className="or-register">
					<span>{translate(messages.or)}&nbsp;</span>
					<Button
						link={add_redirect('/sign-in', this.props.location)} 
						button_style={style.or_register.register} 
						action={this.cancel_registration}>

						{translate(user_bar_messages.sign_in)}
					</Button>
				</div>

				<div style={style.clearfix}></div>

				{/* "Name" */}
				<Text_input
					ref="name"
					name="name"
					focus={this.props.focus_on === 'name'}
					value={this.state.name}
					invalid={this.validate_name(this.state.name)}
					on_change={this.set_name}
					label={translate(messages.name)}
					style={style.input}
					input_style={style.input.input}/>

				{/* "Email" */}
				<Text_input
					ref="email"
					name="email"
					email={true}
					focus={this.props.focus_on === 'email'}
					value={this.state.email}
					invalid={this.registration_email_error(registration_error) || this.validate_email(this.state.email)}
					on_change={this.set_email}
					label={translate(messages.email)}
					style={style.input}
					input_style={style.input.input}/>

				{/* "Password" */}
				<Text_input
					ref="password"
					name="password"
					password={true}
					focus={this.props.focus_on === 'password'}
					value={this.state.password}
					invalid={this.validate_password_on_registration(this.state.password)}
					on_change={this.set_password}
					label={translate(messages.password)}
					style={style.input}
					input_style={style.input.input}/>

				{/* "Accept terms of service" */}
				<Checkbox
					ref="terms_of_service_accepted"
					name="terms_of_service_accepted"
					focus={this.props.focus_on === 'terms_of_service_accepted'}
					style={style.terms_of_service}
					value={this.state.terms_of_service_accepted}
					on_change={this.accept_terms_of_service}
					invalid={this.validate_terms_of_service(this.state.terms_of_service_accepted)}>

					{/* "Accept" */}
					{translate(messages.i_accept)}

					{/* Terms of service link */}
					&nbsp;<a target="_blank" href={require('../../assets/license-agreement/' + get_language_from_locale(this.props.locale) + '.html')}>{translate(messages.the_terms_of_service)}</a>
				</Checkbox>

				{/* Support redirecting to the initial page when javascript is disabled */}
				<input
					type="hidden"
					name="request"
					value={should_redirect_to(this.props.location)}/>

				{/* "Register" button */}
				<Form_actions>
					<Button
						submit={true}
						style={style.form_action.register}
						busy={this.props.signing_in || this.props.registering}>

						{translate(user_bar_messages.register)}
					</Button>
				</Form_actions>
			</Form>
		)

		return markup
	}

	focus(name)
	{
		if (name)
		{
			return this.refs[name].focus()
		}

		if (this.state.register)
		{
			this.refs.name.focus()
		}
		else
		{
			this.refs.email.focus()
		}
	}

	set_name(name)
	{
		this.props.dispatch({ type: 'reset user registration error' })

		this.setState({ name })
	}

	set_email(email)
	{
		this.props.dispatch({ type: 'reset user sign in error' })
		this.props.dispatch({ type: 'reset user registration error' })

		this.setState({ email })
	}

	set_password(password)
	{
		this.props.dispatch({ type: 'reset user sign in error' })
		this.props.dispatch({ type: 'reset user registration error' })

		this.setState({ password })
	}

	sign_in_email_error(error)
	{
		const { translate } = this.props

		if (error && error.field === 'email')
		{
			if (error.status === http_status_codes.Not_found)
			{
				return translate(messages.user_not_found)
			}

			return translate(messages.sign_in_error)
		}
	}

	sign_in_password_error(error)
	{
		const { translate } = this.props

		if (error && error.field === 'password')
		{
			if (error.status === http_status_codes.Input_rejected)
			{
				return translate(messages.wrong_password)
			}

			return translate(messages.sign_in_error)
		}
	}

	registration_email_error(error)
	{
		const { translate } = this.props

		if (error && error.field === 'email')
		{
			if (error.message === 'User is already registered for this email')
			{
				return translate(messages.email_already_registered)
			}

			return translate(messages.registration_error)
		}
	}

	validate_email(value)
	{
		if (!value)
		{
			return this.props.translate(messages.authentication_email_is_required)
		}
	}

	validate_password_on_sign_in(value)
	{
		if (!value)
		{
			return this.props.translate(messages.authentication_password_is_required)
		}
	}

	validate_password_on_registration(value)
	{
		if (!value)
		{
			return this.props.translate(messages.registration_password_is_required)
		}
	}

	validate_name(value)
	{
		if (!value)
		{
			return this.props.translate(messages.registration_name_is_required)
		}
	}

	validate_terms_of_service(value)
	{
		if (!value)
		{
			return this.props.translate(messages.registration_terms_of_service_acceptance_is_required)
		}
	}

	async sign_in()
	{
		try
		{
			if (this.props.on_busy)
			{
				this.props.on_busy()
			}

			await this.props.sign_in
			({
				email    : this.state.email,
				password : this.state.password
			})

			// Scramble the password (just in case)
			this.setState({ password: undefined, show: false })

			// Redirect to a page
			if (redirection_target(this.props.location)
				|| this.props.location.pathname === '/sign-in'
				|| this.props.location.pathname === '/register')
			{
				// Revisit current URL now being logged in
				this.props.dispatch(redirect(should_redirect_to(this.props.location)))
			}
		}
		catch (error)
		{
			// swallows Http errors and Rest Api errors
			// so that they're not output to the console
			if (!error.status)
			{
				throw error
			}

			if (error.status === http_status_codes.Not_found)
			{
				this.refs.email.focus()
			}
			else if (error.status === http_status_codes.Input_rejected)
			{
				this.refs.password.focus()
			}
		}
		finally
		{
			if (this.props.on_busy)
			{
				this.props.on_idle()
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
			if (this.props.on_busy)
			{
				this.props.on_busy()
			}

			const result = await this.props.register
			({
				name                      : this.state.name,
				email                     : this.state.email,
				password                  : this.state.password,
				terms_of_service_accepted : true // is used when posting the <form/>
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
			// swallows Http errors and Rest Api errors
			// so that they're not output to the console
			if (!error.status)
			{
				throw error
			}

			if (error.message === 'User is already registered for this email')
			{
				this.refs.email.focus()
			}
		}
		finally
		{
			if (this.props.on_busy)
			{
				this.props.on_idle()
			}
		}
	}

	sign_in_error(error)
	{
		const { translate } = this.props

		if (!error)
		{
			return
		}

		if (error.field === 'email' || error.field === 'password')
		{
			return
		}

		if (error.message === `Login attempts limit exceeded`)
		{
			return translate(messages.login_attempts_limit_exceeded_error)
		}

		return translate(messages.sign_in_error)
	}

	registration_error(error)
	{
		const { translate } = this.props

		if (!error)
		{
			return
		}

		if (error.field === 'email')
		{
			return
		}

		return translate(messages.registration_error)
	}

	reset_validation()
	{
		this.refs.form.reset_validation_indication()
	}

	start_registration()
	{
		this.props.dispatch({ type: 'reset user sign in error' })
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
		this.props.dispatch({ type: 'reset user registration error' })

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
		margin-top : 0

	or_register
		// margin-top : 0.42em

		register
			text-transform : lowercase
			// font-weight: normal

	terms_of_service
		margin-top: 1.5em
		// margin-bottom: 1.2em

	forgot_password
		font-weight: normal

		float   : left
		z-index : 1

	form_action

		text-align: right
		display: block

		&register
			margin-top: 1em
			// margin-bottom: 1em

	clearfix
		clear : both

	input
		margin-bottom : 0.5em

		input
			width : 100%

	sign_in_buttons
		margin-top: 1.5em
`