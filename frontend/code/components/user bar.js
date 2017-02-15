import React, { Component, PropTypes } from 'react'
import { Link }    from 'react-isomorphic-render'
import classNames  from 'classnames'
import { connect } from 'react-redux'
import style       from 'react-styling'

import { defineMessages } from 'react-intl'

import international from '../international/internationalize'

import { Form, Button, Select, ActivityIndicator } from 'react-responsive-ui'

import Modal               from './modal'
import Authentication_form from './authentication form'
import User                from './user'
import User_picture        from './user picture'

import { bindActionCreators as bind_action_creators } from 'redux'

import { sign_out, connector } from '../redux/authentication'
import { preload_started } from '../redux/preload'

@connect
(
	(state) =>
	({
		...connector(state.authentication),
		realtime_service_is_connected : state.realtime_service.connected
	}),
	{
		sign_out,
		preload_started
	}
)
@international
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

	constructor()
	{
		super()

		this.hide = this.hide.bind(this)
		this.show = this.show.bind(this)
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
		const
		{
			user,
			register_pending,
			sign_in_pending,
			sign_in_with_access_code_pending,
			translate,
			style,
			realtime_service_is_connected
		}
		= this.props

		const
		{
			password,
			show
		}
		= this.state

		const markup =
		(
			<div className="user-bar" style={ style }>

				{/* WebSocket status indicator (client side only) */}
				{ !realtime_service_is_connected &&
					<ActivityIndicator
						className="realtime-service-indicator"
						title={ translate(messages.realtime_service_connecting) }/>
				}

				{/* Sign in action */}
				{ !user &&
					<Button
						className="sign-in"
						link="/sign-in"
						action={ this.show }>
						{ translate(messages.sign_in) }
					</Button>
				}

				{/* "Sign out" button for javascriptless users */}
				{/* user && this.render_sign_out_fallback() */}

				{/* User info if authenticated */}
				{ user && this.render_user_info(user) }

				{/* Sign in / Register popup */}
				<Modal
					busy={ register_pending || sign_in_pending || sign_in_with_access_code_pending }
					isOpen={ exists(password) || (!user && show) }
					close={ this.hide }>

					<Authentication_form
						close={ this.hide }/>
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
					submit
					className="sign-out sign-out--fallback"
					style={ styles.sign_out }>
					{ translate(messages.sign_out) }
				</Button>
			</Form>
		)

		return markup
	}

	render_user_info(user)
	{
		const { translate } = this.props

		{/* User name and user picture */}
		const user_info =
		(
			<Link
				to={ User.url(user) }
				style={ styles.user_menu_toggler }>

				{/* User name */}
				<span
					className="user-name">
					{ user.name }
				</span>

				{/* User picture */}
				<User_picture
					className="user-picture--header"
					user={ user }/>
			</Link>
		)

		const markup =
		(
			<div className="user-info">

				{/* Dropdown */}
				<Select
					menu
					toggler={ user_info }
					alignment="right">

					{/* Profile */}
					<Link key="profile" to={ User.url(user) }>
						{/* Icon */}
						<i className="material-icons dropdown-item__icon">account_box</i>
						{/* Text */}
						{ translate(messages.profile) }
					</Link>

					{/* Settings */}
					<Link key="settings" to="/settings">
						{/* Icon */}
						<i className="material-icons dropdown-item__icon">settings</i>
						{/* Text */}
						{ translate(messages.settings) }
					</Link>

					{/* Feed */}
					<Link key="notifications" to="/feed">
						{/* Icon */}
						<i className="material-icons dropdown-item__icon">notifications</i>
						{/* Text */}
						{ translate(messages.notifications) }
					</Link>

					{/* Messages */}
					<Link key="messages" to="/messages">
						{/* Icon */}
						<i className="material-icons dropdown-item__icon">chat_bubble_outline</i>
						{/* Text */}
						{ translate(messages.messages) }
					</Link>

					{/* Separator */}
					<Select.Separator/>

					{/* Sign out */}
					<div key="sign_out" onClick={ this.sign_out }>
						{/* Icon */}
						<i className="material-icons material-icons--empty dropdown-item__icon"></i>
						{/* Text */}
						<Button
							className="sign-out"
							style={ styles.sign_out }>
							{ translate(messages.sign_out) }
						</Button>
					</div>
				</Select>
			</div>
		)

		return markup
	}

	async sign_out()
	{
		await this.props.sign_out()

		this.props.preload_started()

		// Refresh the current page after logout
		window.location = location.pathname + (location.search || '') + (location.hash || '')
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

const styles = style
`
	sign_out
		// Black instead of white
		color      : inherit
		// So that the CSS animation for ".rrui__select__option"
		// doesn't conflict with the CSS animation for ".rrui__button"
		transition : none

	user_menu_toggler
		display     : flex
		align-items : center
		// Black instead of white
		color       : inherit
`

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
	},
	realtime_service_connecting:
	{
		id             : 'realtime_service.connecting',
		description    : 'Connecting to realtime push notifications service',
		defaultMessage : 'Connecting...'
	}
})