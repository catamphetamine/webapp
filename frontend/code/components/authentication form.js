import React, { Component, PropTypes } from 'react'

import { connect } from 'react-redux'
import styler      from 'react-styling'

import { redirect } from 'react-isomorphic-render/redux'

import { defineMessages, FormattedMessage } from 'react-intl'
import international from '../international/internationalize'

import Text_input             from './form/text input'
import Checkbox               from './form/checkbox'
import Submit                 from './form/submit'
import { Form, Button }       from 'react-responsive-ui'
import User                   from './user'
import Time_ago               from './time ago'

import http_status_codes from '../tools/http status codes'

import { messages as user_bar_messages } from './user bar'

import { add_redirect, should_redirect_to, redirection_target } from '../helpers/redirection'

import { bindActionCreators as bind_action_creators } from 'redux'

import
{
	sign_in,
	sign_in_reset_error,
	register,
	register_reset_error
}
from '../actions/authentication'

import { preload_started } from '../actions/preload'

import { get_language_from_locale } from '../../../code/locale'

import Redux_form, { Field } from 'simpler-redux-form'

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
	user_is_self_blocked:
	{
		id             : 'authentication.error.user_is_self_blocked',
		description    : 'A note that this user has opted into temporarily blocking his own account for safety concerns',
		defaultMessage : `You willingly temporarily blocked your account {details}`
	},
	user_is_self_blocked_details:
	{
		id             : 'authentication.error.user_is_self_blocked_details',
		description    : 'Date when this user has opted into temporarily blocking his own account for safety concerns',
		defaultMessage : `{blocked_at}`
	},
	user_is_blocked:
	{
		id             : 'authentication.error.user_is_blocked',
		description    : 'A note that this user is blocked',
		defaultMessage : `Your account was blocked {details}`
	},
	user_is_blocked_details:
	{
		id             : 'authentication.error.user_is_blocked_details',
		description    : 'A date when this user was blocked along with the details',
		defaultMessage : `{blocked_at} by {blocked_by} with reason: "{blocked_reason}"`
	},
	unblock_instructions:
	{
		id             : 'authentication.unblock_instructions',
		description    : 'Instructions on unblocking this blocked user',
		defaultMessage : `To request unblocking your account you can contact support by email {support_email}"`
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

@Redux_form
({
	id: 'authentication_form',
	submitting: (state, props) =>
	{
		if (props.sign_in)
		{
			return state.authentication.sign_in_pending
		}

		if (props.register)
		{
			return state.authentication.registration_pending
		}

		return state.authentication.sign_in_pending || state.authentication.registration_pending
	}
})
@connect
(
	model =>
	({
		sign_in_error  : model.authentication.sign_in_error,
		register_error : model.authentication.register_error,

		registration_pending : model.authentication.registration_pending,
		sign_in_pending      : model.authentication.sign_in_pending,

		locale   : model.locale.locale,
		location : model.router.location
	}),
	dispatch =>
	({
		dispatch,
		...bind_action_creators
		({
			sign_in,
			sign_in_reset_error,
			register,
			register_reset_error,
			preload_started
		},
		dispatch)
	})
)
@international()
export default class Authentication_form extends Component
{
	state =
	{
		register : false
	}

	static propTypes =
	{
		user               : PropTypes.object,

		sign_in_pending  : PropTypes.bool,
		register_pending : PropTypes.bool,

		sign_in_error  : PropTypes.object,
		register_error : PropTypes.object,

		style        : PropTypes.object,
		on_sign_in   : PropTypes.func,

		registration : PropTypes.bool,

		focus_on     : PropTypes.string,

		location     : PropTypes.object,

		initial_values : PropTypes.object
	}

	static defaultProps =
	{
		initial_values : {}
	}

	constructor(properties)
	{
		super(properties)

		this.focus                             = this.focus.bind(this)
		this.sign_in                           = this.sign_in.bind(this)
		this.start_registration                = this.start_registration.bind(this)
		this.forgot_password                   = this.forgot_password.bind(this)
		this.register                          = this.register.bind(this)
		this.cancel_registration               = this.cancel_registration.bind(this)
		this.reset_errors                      = this.reset_errors.bind(this)
		this.validate_name                     = this.validate_name.bind(this)
		this.validate_terms_of_service         = this.validate_terms_of_service.bind(this)
		this.validate_email                    = this.validate_email.bind(this)
		this.validate_password_on_sign_in      = this.validate_password_on_sign_in.bind(this)
		this.validate_password_on_registration = this.validate_password_on_registration.bind(this)

		if (this.props.registration)
		{
			this.state.register = true
		}
	}

	componentDidMount()
	{
		setTimeout(() => this.props.focus('email'), 0)
	}

	componentWillUnmount()
	{
		this.props.sign_in_reset_error()
		this.props.register_reset_error()
	}

	render()
	{
		return this.state.register ? this.render_registration_form() : this.render_sign_in_form()
	}

	render_sign_in_form()
	{
		const
		{
			translate,
			sign_in_error,
			sign_in_pending,
			error,
			initial_values,
			submit,
			submitting
		}
		= this.props

		const markup =
		(
			<Form
				className="authentication-form"
				style={this.props.style ? { ...style.form, ...this.props.style } : style.form}
				action={submit(this.reset_errors, this.sign_in)}
				busy={submitting}
				focus={this.focus}
				error={error || this.sign_in_error(sign_in_error)}
				post="/users/legacy/sign-in">

				{/* "Sign in" */}
				<h2 style={style.form_title}>{translate(user_bar_messages.sign_in)}</h2>

				{/* "or register" */}
				<div style={style.or_register} className="or-register">
					<span>{translate(messages.or)}&nbsp;</span>
					<Button
						link={add_redirect('/register', this.props.location)}
						buttonStyle={style.or_register.register}
						action={this.start_registration}
						disabled={sign_in_pending}>

						{translate(user_bar_messages.register)}
					</Button>
				</div>

				<div style={style.clearfix}></div>

				{/* "Email" */}
				<Text_input
					name="email"
					email={true}
					focus={this.props.focus_on === 'email'}
					value={initial_values.email}
					error={this.sign_in_email_error(sign_in_error)}
					validate={this.validate_email}
					label={translate(messages.email)}
					inputStyle={style.input.input}/>

				{/* "Password" */}
				<Text_input
					name="password"
					password={true}
					focus={this.props.focus_on === 'password'}
					value={initial_values.password}
					error={this.sign_in_password_error(sign_in_error)}
					validate={this.validate_password_on_sign_in}
					label={translate(messages.password)}
					inputStyle={style.input.input}/>

				{/* Support redirecting to the initial page when javascript is disabled */}
				<input type="hidden" name="request" value={should_redirect_to(this.props.location)}/>

				<Form.Error/>

				{/* Unblock user instructions */}
				{ sign_in_error && sign_in_error.status === http_status_codes.Access_denied &&
					<FormattedMessage
						{...messages.unblock_instructions}
						values={{ support_email: <a href={`mailto:${configuration.support.email}`}>{configuration.support.email}</a> }}
						tagName="p"/>
				}

				<Form.Actions className="rrui__form__actions--left-right">
					{/* "Forgot password" */}
					<Button
						style={style.forgot_password}
						action={this.forgot_password}
						disabled={sign_in_pending}>

						{translate(messages.forgot_password)}
					</Button>

					{/* "Sign in" button */}
					<Submit
						component={Button}
						submit={true}>
						{translate(user_bar_messages.sign_in)}
					</Submit>
				</Form.Actions>
			</Form>
		)

		return markup
	}

	render_registration_form()
	{
		const
		{
			translate,
			register_error,
			error,
			sign_in_pending,
			register_pending,
			initial_values,
			submit,
			submitting
		}
		= this.props

		const markup =
		(
			<Form
				className="registration-form"
				style={this.props.style ? { ...style.form, ...this.props.style } : style.form}
				action={submit(this.register)}
				busy={submitting}
				focus={this.focus}
				error={error || this.registration_error(register_error)}
				post="/users/legacy/register">

				{/* "Register" */}
				<h2 style={style.form_title}>{translate(user_bar_messages.register)}</h2>

				{/* "or sign in" */}
				<div style={style.or_register} className="or-register">
					<span>{translate(messages.or)}&nbsp;</span>
					<Button
						link={add_redirect('/sign-in', this.props.location)}
						buttonStyle={style.or_register.register}
						action={this.cancel_registration}
						disabled={sign_in_pending || register_pending}>

						{translate(user_bar_messages.sign_in)}
					</Button>
				</div>

				<div style={style.clearfix}></div>

				{/* "Name" */}
				<Text_input
					name="name"
					focus={this.props.focus_on === 'name'}
					value={initial_values.name}
					validate={this.validate_name}
					label={translate(messages.name)}
					inputStyle={style.input.input}/>

				{/* "Email" */}
				<Text_input
					name="email"
					email={true}
					focus={this.props.focus_on === 'email'}
					value={initial_values.email}
					error={this.registration_email_error(register_error)}
					validate={this.validate_email}
					label={translate(messages.email)}
					inputStyle={style.input.input}/>

				{/* "Password" */}
				<Text_input
					name="password"
					password={true}
					focus={this.props.focus_on === 'password'}
					value={initial_values.password}
					validate={this.validate_password_on_registration}
					label={translate(messages.password)}
					inputStyle={style.input.input}/>

				{/* "Accept terms of service" */}
				<Checkbox
					name="terms_of_service_accepted"
					focus={this.props.focus_on === 'terms_of_service_accepted'}
					style={style.terms_of_service}
					value={initial_values.terms_of_service_accepted}
					validate={this.validate_terms_of_service}>

					{/* "Accept" */}
					{translate(messages.i_accept)}

					{/* Terms of service link */}
					&nbsp;<a target="_blank" href={require('../../assets/license-agreement/' + get_language_from_locale(this.props.locale) + '.html')}>{translate(messages.the_terms_of_service)}</a>
				</Checkbox>

				{/* Send `locale` when javascript is disabled */}
				<input
					type="hidden"
					name="locale"
					value={this.props.locale}/>

				{/* Support redirecting to the initial page when javascript is disabled */}
				<input
					type="hidden"
					name="request"
					value={should_redirect_to(this.props.location)}/>

				{/* "Register" button */}
				<Form.Actions className="rrui__form__actions--right">
					<Submit>
						{translate(user_bar_messages.register)}
					</Submit>
				</Form.Actions>
			</Form>
		)

		return markup
	}

	focus(name)
	{
		if (!name)
		{
			name = this.state.register ? 'name' : 'email'
		}

		this.props.focus(name)
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

	async sign_in(fields)
	{
		try
		{
			await this.props.sign_in
			({
				email    : fields.email,
				password : fields.password
			})

			// Hide the modal
			this.setState({ show: false })

			const { location, dispatch } = this.props

			// Refresh the page so that `authentication_token`
			// is applied to the `http` tool.

			this.props.preload_started()

			// Redirect to a page
			if (location.pathname === '/unauthenticated'
				|| location.pathname === '/unauthorized'
				|| location.pathname === '/sign-in'
				|| location.pathname === '/register')
			{
				return window.location = should_redirect_to(location)
			}

			// Refresh the current page after login
			window.location = location.pathname + (location.search || '') + (location.hash || '')
		}
		catch (error)
		{
			// swallows Http errors and Rest Api errors
			// so that they're not output to the console
			if (!error.status)
			{
				throw error
			}

			if (error.status === http_status_codes.Input_rejected)
			{
				this.props.clear('password', this.validate_password_on_sign_in())
			}
		}
	}

	forgot_password()
	{
		alert('To be done')
	}

	async register(fields)
	{
		try
		{
			const result = await this.props.register
			({
				name                      : fields.name,
				email                     : fields.email,
				password                  : fields.password,
				terms_of_service_accepted : true, // is used when posting the <form/>
				locale                    : this.props.locale
			})

			// // Switch to sign in form
			// this.cancel_registration()

			// Sign in as the newly created user

			// Won't show validation errors for sign-in form
			// (because `indicate_invalid` is set to `true` only on form submit)
			// await this.sign_in()

			// Submit the sign-in form
			this.setState({ register: false }, () =>
			{
				this.props.submit(this.sign_in)()
			})
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
				// this.props.focus('email')
			}
		}
	}

	sign_in_error(error)
	{
		const { translate, locale } = this.props

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

		if (error.status === http_status_codes.Access_denied)
		{
			let details_parameters =
			{
				// blocked_at_relative : new Time_ago(locale).format(error.blocked_at),
				// blocked_at_full     : new Date_time_formatter(locale).format(error.blocked_at),
				blocked_at : <Time_ago>{error.blocked_at}</Time_ago>
			}

			if (error.self_block)
			{
				const parameters =
				{
					details : <span className="form__error-details">
						<FormattedMessage
							{...messages.user_is_self_blocked_details}
							values={details_parameters}/>
					</span>
				}

				return <FormattedMessage
					{...messages.user_is_self_blocked}
					values={parameters}/>
			}

			details_parameters =
			{
				...details_parameters,
				blocked_by     : <User>{error.blocked_by}</User>,
				blocked_reason : error.blocked_reason
			}

			const parameters =
			{
				details : <span className="form__error-details">
					<FormattedMessage
						{...messages.user_is_blocked_details}
						values={details_parameters}/>
				</span>
			}

			return <FormattedMessage
				{...messages.user_is_blocked}
				values={parameters}/>

			// return translate(messages.user_is_blocked,
			// {
			// 	...parameters,
			// 	// blocked_by     : <User>{error.blocked_by}</User>,
			// 	blocked_by     : error.blocked_by.name,
			// 	blocked_reason : error.blocked_reason
			// })
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
		this.props.reset_invalid_indication()
	}

	reset_errors()
	{
		this.props.sign_in_reset_error()
		this.props.register_reset_error()
	}

	start_registration()
	{
		this.props.sign_in_reset_error()
		this.props.register_reset_error()

		this.reset_validation()

		this.setState({ register: true }, () =>
		{
			this.props.focus('name')
		})
	}

	cancel_registration()
	{
		this.props.sign_in_reset_error()
		this.props.register_reset_error()

		this.reset_validation()

		this.setState({ register: false }, () =>
		{
			this.props.focus('email')
		})
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
		z-index : 0

	clearfix
		clear : both

	input
		input
			width : 100%

		margin-top: 1em
`