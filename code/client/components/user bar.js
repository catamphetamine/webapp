import React, { Component, PropTypes } from 'react'
// import ReactDOM from 'react-dom'
import { Link } from 'react-router'

import { connect } from 'react-redux'
import styler      from 'react-styling'

import { defineMessages } from 'react-intl'
import international from '../international/internationalize'

import Text_input          from './text input'
import Checkbox            from './checkbox'
import Button              from './button'
import Form                from './form'
import Modal               from './modal'
import Authentication_form from './authentication form'
import User_picture        from './user picture'
import Dropdown            from './dropdown'

import { bindActionCreators as bind_action_creators } from 'redux'

import { sign_out } from '../actions/authentication'

export const messages = defineMessages
({
	sign_in:
	{
		id             : 'authentication.sign_in',
		description    : 'Log in action',
		defaultMessage : 'Sign in'
	},
	sign_out:
	{
		id             : 'authentication.sign_out',
		description    : 'Log out action',
		defaultMessage : 'Sign out'
	},
	register:
	{
		id             : 'authentication.register',
		description    : 'Registration action',
		defaultMessage : 'Register'
	},
	notifications:
	{
		id             : 'user_menu.notifications',
		description    : 'Notifications user menu item',
		defaultMessage : 'Notifications'
	},
	messages:
	{
		id             : 'user_menu.messages',
		description    : 'Messages user menu item',
		defaultMessage : 'Messages'
	},
	profile:
	{
		id             : 'user_menu.profile',
		description    : 'Profile user menu item',
		defaultMessage : 'Profile'
	},
	settings:
	{
		id             : 'user_menu.settings',
		description    : 'Settings user menu item',
		defaultMessage : 'Settings'
	}
})

@connect
(
	model => 
	({
		user           : model.authentication.user,
		sign_out_error : model.authentication.sign_out_error
	}),
	dispatch =>
	{
		const props = bind_action_creators
		({
			sign_out
		},
		dispatch)

		props.dispatch = dispatch

		return props
	}
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
		register : false
	}

	static propTypes =
	{
		user           : PropTypes.object,
		sign_out_error : PropTypes.object,
		sign_out       : PropTypes.func.isRequired
	}

	constructor(properties)
	{
		super(properties)

		this.hide     = this.hide.bind(this)
		this.show     = this.show.bind(this)
		this.sign_out = this.sign_out.bind(this)

		extend(this.state, this.pristine_form_state)
	}

	componentWillReceiveProps(props)
	{
		// hide modal after user signed in
		if (props.user && !this.props.user)
		{
			this.hide()
		}
	}

	render()
	{
		const { user, translate } = this.props

		const markup =
		(
			<div className="user-bar" style={this.props.style}>
				
				{/* Sign in action */}
				{ !user && <Button className="sign-in" link="/sign-in" action={this.show}>{this.translate(messages.sign_in)}</Button> }

				{/* User info if authenticated */}
				{ user && this.render_user_info(user) }

				<Modal
					isOpen={exists(this.state.password) || (!user && this.state.show)}
					onRequestClose={this.hide}>

					<Authentication_form/>
				</Modal>
			</div>
		)

		return markup
	}

	render_user_info(user)
	{
		const { translate } = this.props

		{/* Username and user picture */}
		const user_info =
		(
			<Link
				to={`/user/${user.id}`}>

				{/* Username */}
				<span
					style={style.user_menu_toggler.element}
					className="user-name">
					{user.name}
				</span>

				{/* User picture */}
				<User_picture
					style={style.user_menu_toggler.element} 
					className="user-picture--header"
					user={user}/>
			</Link>
		)

		const markup = 
		(
			<div className="user-info">

				{/* Dropdown */}
				<Dropdown
					menu={true}
					toggler={user_info}
					alignment="right">

					{/* Profile */}
					<Link key="profile" to={`/user/${user.id}`}>
						{/* Icon */}
						<i className="material-icons">account_box</i>
						{/* Text */}
						{translate(messages.profile)}
					</Link>

					{/* Settings */}
					<Link key="settings" to="/settings">
						{/* Icon */}
						<i className="material-icons">settings</i>
						{/* Text */}
						{translate(messages.settings)}
					</Link>

					{/* Feed */}
					<Link key="notifications" to="/feed">
						{/* Icon */}
						<i className="material-icons">notifications</i>
						{/* Text */}
						{translate(messages.notifications)}
					</Link>

					{/* Messages */}
					<Link key="messages" to="/messages">
						{/* Icon */}
						<i className="material-icons">chat_bubble_outline</i>
						{/* Text */}
						{translate(messages.messages)}
					</Link>

					{/* Separator */}
					<div className="dropdown-separator"/>

					{/* Sign out */}
					<div key="log_out" onClick={event =>
					{
						if (event.target.type !== 'submit')
						{
							this.sign_out()
						}
					}}>
						<Form className="sign-out-form" post="/authentication/legacy/sign-out">
							{/* Icon */}
							<i className="material-icons material-icons--empty"></i>
							{/* Text */}
							<Button style={style.sign_out} className="sign-out" submit={true} action={this.sign_out}>{this.translate(messages.sign_out)}</Button>
						</Form>
					</div>
				</Dropdown>
			</div>
		)

		return markup
	}

	translate(message)
	{
		return this.props.translate(message)
	}

	change_user_picture()
	{
		alert('to do')
	}

	show()
	{
		this.setState({ show: true }, () =>
		{
			// this.refs.authentication_form.focus()
		})
	}

	hide()
	{
		this.setState({ show: false, ...this.pristine_form_state })
	}

	async sign_out()
	{
		try
		{
			await this.props.sign_out()
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
}

const style = styler
`
	sign_out
		display: inline-block

	user_menu_toggler
		element
			display: inline-block
			vertical-align: middle
`