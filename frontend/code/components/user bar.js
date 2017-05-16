import React, { Component, PropTypes } from 'react'
import { Link }    from 'react-isomorphic-render'
import classNames  from 'classnames'
import { connect } from 'react-redux'
import style       from 'react-styling'
import { defineMessages } from 'react-intl'
import { Form, Button, Select, ActivityIndicator, Modal } from 'react-responsive-ui'

import international from '../international/internationalize'
import default_messages from './messages'

import Sign_in_form   from './sign in form/sign in form'
import Poster         from './poster'
import Poster_picture from './poster picture'

import { bindActionCreators as bind_action_creators } from 'redux'

import { sign_out, connector } from '../redux/authentication'
import { preload_started, preload_finished } from '../redux/preload'

import Person_icon   from '../../assets/images/icons/person.svg'
import Settings_icon from '../../assets/images/icons/settings.svg'
import Radio_icon    from '../../assets/images/icons/radio.svg'
import Message_icon  from '../../assets/images/icons/message.svg'

@connect
(
	(state) =>
	({
		...connector(state.authentication),
		realtime_service_is_connected : state.realtime_service.connected
	}),
	{
		sign_out,
		preload_started,
		preload_finished
	}
)
@international
export default class Authentication extends Component
{
	state = {}

	constructor()
	{
		super()

		this.hide = this.hide.bind(this)
		this.show = this.show.bind(this)
		this.sign_out = this.sign_out.bind(this)
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
			authenticate_pending,
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
					busy={ register_pending || sign_in_pending || authenticate_pending }
					isOpen={ exists(password) || (!user && show) }
					close={ this.hide }
					closeLabel={ translate(default_messages.cancel) }>

					<Sign_in_form
						open={ this.hide }
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
				to={ Poster.url(user) }
				className="user-bar__name-and-picture">

				{/* User name */}
				<div
					className="user-bar__name">
					{ user.poster.name }
				</div>

				{/* User picture */}
				<Poster_picture
					className="poster-picture--header"
					poster={ user.poster }/>
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
					<Link
						key="profile"
						to={ Poster.url(user.poster) }
						className="user-menu__entry">
						{/* Icon */}
						<Person_icon className="user-menu__icon"/>
						{/* Text */}
						{ translate(messages.profile) }
					</Link>

					{/* Settings */}
					<Link
						key="settings"
						to="/settings"
						className="user-menu__entry">
						{/* Icon */}
						<Settings_icon className="user-menu__icon"/>
						{/* Text */}
						{ translate(messages.settings) }
					</Link>

					{/* Feed */}
					<Link
						key="notifications"
						to="/feed"
						className="user-menu__entry">
						{/* Icon */}
						<Radio_icon className="user-menu__icon"/>
						{/* Text */}
						{ translate(messages.notifications) }
					</Link>

					{/* Messages */}
					<Link
						key="messages"
						to="/messages"
						className="user-menu__entry">
						{/* Icon */}
						<Message_icon className="user-menu__icon"/>
						{/* Text */}
						{ translate(messages.messages) }
					</Link>

					{/* Separator */}
					<Select.Separator/>

					{/* Sign out */}
					<div
						key="sign-out"
						onClick={ this.sign_out }
						className="user-menu__entry user-menu__entry--sign-out">
						{/* Icon */}
						<div className="user-menu__icon"/>
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
		const
		{
			preload_started,
			preload_finished,
			sign_out
		}
		= this.props

		try
		{
			await sign_out()

			preload_started()

			// Refresh the current page after logout
			window.location = location.pathname + (location.search || '') + (location.hash || '')
		}
		catch (error)
		{
			preload_finished()
		}
	}

	show()
	{
		this.setState({ show: true })
	}

	hide()
	{
		this.setState({ show: false })
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