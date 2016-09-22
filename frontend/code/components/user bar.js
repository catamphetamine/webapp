import React, { Component, PropTypes } from 'react'
import { Link }    from 'react-router'
import classNames  from 'classnames'
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
import Dropdown, { Dropdown_separator } from './dropdown'
import Spinner             from './spinner'

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
		user                 : model.authentication.user,
		sign_out_error       : model.authentication.sign_out_error,
		sign_in_pending      : model.authentication.sign_in_pending,
		registration_pending : model.authentication.registration_pending
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
		user : PropTypes.object,

		sign_out : PropTypes.func.isRequired,
		sign_out_error : PropTypes.object,

		sign_in_pending      : PropTypes.bool,
		registration_pending : PropTypes.bool
	}

	constructor(properties)
	{
		super(properties)

		this.hide = this.hide.bind(this)
		this.show = this.show.bind(this)

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
		const
		{
			user,
			registration_pending,
			sign_in_pending,
			translate
		}
		= this.props

		const markup =
		(
			<div className="user-bar" style={this.props.style}>

				{/* Sign in action */}
				{ !user && <Button className="sign-in" link="/sign-in" action={this.show}>{translate(messages.sign_in)}</Button> }

				{/* "Sign out" button for javascriptless users */}
				{ user && this.render_sign_out_fallback() }

				{/* User info if authenticated */}
				{ user && this.render_user_info(user) }

				{/* Sign in / Register popup */}
				<Modal
					busy={registration_pending || sign_in_pending}
					shown={exists(this.state.password) || (!user && this.state.show)}
					close={this.hide}>

					<Authentication_form form_id="authentication_form_popup"/>
				</Modal>
			</div>
		)

		return markup
	}

	// "Sign out" button for javascriptless users
	render_sign_out_fallback()
	{
		const { translate } = this.props

		const markup =
		(
			<Form
				className="sign-out-form"
				post="/users/legacy/sign-out">

				<Button
					submit={true}
					className="sign-out sign-out--fallback"
					style={style.sign_out}>

					{translate(messages.sign_out)}
				</Button>
			</Form>
		)

		return markup
	}

	render_user_info(user)
	{
		const { translate, sign_out } = this.props

		{/* Username and user picture */}
		const user_info =
		(
			<Link
				to={`/user/${user.id}`}
				style={style.user_menu_toggler}>

				{/* Username */}
				<span
					className="user-name">
					{user.name}
				</span>

				{/* User picture */}
				<User_picture
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
					<Link key="profile" to={`/user/${user.username || user.id}`}>
						{/* Icon */}
						<i className="material-icons dropdown-item__icon">account_box</i>
						{/* Text */}
						{translate(messages.profile)}
					</Link>

					{/* Settings */}
					<Link key="settings" to="/settings">
						{/* Icon */}
						<i className="material-icons dropdown-item__icon">settings</i>
						{/* Text */}
						{translate(messages.settings)}
					</Link>

					{/* Feed */}
					<Link key="notifications" to="/feed">
						{/* Icon */}
						<i className="material-icons dropdown-item__icon">notifications</i>
						{/* Text */}
						{translate(messages.notifications)}
					</Link>

					{/* Messages */}
					<Link key="messages" to="/messages">
						{/* Icon */}
						<i className="material-icons dropdown-item__icon">chat_bubble_outline</i>
						{/* Text */}
						{translate(messages.messages)}
					</Link>

					{/* Separator */}
					<Dropdown_separator/>

					{/* Sign out */}
					<div key="sign_out" onClick={sign_out}>
						{/* Icon */}
						<i className="material-icons material-icons--empty dropdown-item__icon"></i>
						{/* Text */}
						<Button
							className="sign-out"
							style={style.sign_out}>
							{translate(messages.sign_out)}
						</Button>
					</div>
				</Dropdown>
			</div>
		)

		return markup
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
}

const style = styler
`
	sign_out
		display: inline-block

	user_menu_toggler
		display     : flex
		align-items : center
`