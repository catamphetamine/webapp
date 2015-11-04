import React, { Component, PropTypes } from 'react'
import { PropTypes as React_router_prop_types } from 'react-router'
import { webpage_head } from '../webpage head'

// использование: @Radium перед классом компонента
// Radium = require 'radium'

import { Link, IndexLink } from 'react-router'

import styler from 'react-styling'
// import autoprefixer from 'autoprefixer'

import { bindActionCreators as bind_action_creators } from 'redux'
import { logout } from '../actions/authentication'

// import { create_transition_hook } from '../../react-isomorphic-render/router'

import { text as Text } from '../international components'

import { connect } from 'react-redux'

// import {isLoaded as isAuthLoaded} from '../flux/stores/auth'

import Locale_switcher from '../components/locale switcher'

import { defineMessages, injectIntl as international } from 'react-intl'

import Menu from '../components/menu'

const messages = defineMessages
({
	title:
	{
		id             : 'application.title',
		description    : 'Web application title',
		defaultMessage : 'WebApp'
	},
	description:
	{
		id             : 'application.description',
		description    : 'Web application description',
		defaultMessage : 'A generic web application boilerplate'
	}
})

@connect
(
	store => ({ }), // user: store.auth.user })
	dispatch => bind_action_creators({ logout }, dispatch)
)
class Layout extends Component
{
	state = {}

	static propTypes =
	{
		children : PropTypes.object.isRequired,
		user     : PropTypes.object,
		logout   : PropTypes.func.isRequired
	}

	static contextTypes =
	{
		// router : PropTypes.object.isRequired,
		history : React_router_prop_types.history.isRequired,
		store   : PropTypes.object.isRequired
	}

	constructor(props)
	{
		super(props)

		this.document_clicked = this.document_clicked.bind(this)
	}

	componentDidMount()
	{
		// window.client_side_routing = true

		this.unlisten_history = this.context.history.listen(location => this.state.show_menu = false)

		document.addEventListener('click', this.document_clicked)
	}

	componentWillUnmount()
	{
		this.unlisten_history()

		document.removeEventListener('click', this.document_clicked)
	}

	componentWillReceiveProps(nextProps)
	{
		if (!this.props.user && nextProps.user)
		{
			// login
			this.context.router.transitionTo('/login_success')
		} 
		else if (this.props.user && !nextProps.user)
		{
			// logout
			this.context.router.transitionTo('/')
		}
	}

	handle_logout(event)
	{
		event.preventDefault()
		this.props.logout()
	}

	render()
	{
		const format_message = this.props.intl.formatMessage

		// Html document metadata

		const title = 'WebApp'
		const description = 'A generic web application boilerplate'

		const meta =
		{
			charSet: 'utf-8',
			property:
			{
				'og:site_name': title,
				// 'og:image': image,
				'og:locale': 'ru_RU',
				'og:title': title,
				'og:description': description,

				// 'twitter:card': 'summary',
				// 'twitter:site': '@erikras',
				// 'twitter:creator': '@erikras',
				// 'twitter:title': title,
				// 'twitter:description': description,
				// 'twitter:image': image,
				// 'twitter:image:width': '200',
				// 'twitter:image:height': '200'
			}
		}

		// render the page

		const { user } = this.props

		// <ul className="nav navbar-nav">
		// 	{!user && <li><Link to="/login">Login</Link></li>}
		// 	{user && <li><a href="/logout" onClick={::this.handle_logout}>Logout</a></li>}
		// </ul>

		// {user && <p>Logged in as <strong>{user.name}</strong>.</p>}

		const markup = 
		(
			<div>
				{webpage_head(title, description, meta)}

				{/* header */}
				<header>
					{/* language chooser */}
					<Locale_switcher style={style.locale_switcher}/>

					{/* menu button for small screens */}
					<button className="menu-button" onClick={::this.toggle_menu}>
						<div className="menu-icon"/>
					</button>

					{/* home page link */}
					<div className="logo" style={{ textAlign: 'center' }}>
						<IndexLink to="/" style={style.home} activeStyle={style.home.active}>
							{format_message(messages.title)}
						</IndexLink>
					</div>

					{/* Navigation */}
					{/*<nav>*/}
						{/* main menu */}
						<Menu show={this.state.show_menu}/>
					{/*</nav>*/}
				</header>

				{this.props.children}

				<footer></footer>
			</div>
		)

		return markup
	}

	toggle_menu()
	{
		this.setState({ show_menu: !this.state.show_menu })
	}

	document_clicked(event)
	{
		if (event.target.className === 'menu-icon' 
			|| event.target.className === 'menu-item'
			|| event.target.className === 'menu-button')
		{
			return
		}

		this.setState({ show_menu: false })
	}
}

export default international(Layout)

const style = styler
`
	home
		font-size   : 26pt
		text-decoration : none
		
		// border-bottom-width : 0.08em
		// border-bottom-style : dotted
		// border-bottom-color : black

		active:
			cursor              : default
			border-bottom-width : 0

	locale_switcher
		position: absolute
		right: 0.3em
		top: 0.6em
`