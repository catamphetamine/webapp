import React, { Component, PropTypes } from 'react'
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
import Menu_button from '../components/menu button'

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
	},

	menu_editor:
	{
		id             : 'menu.editor',
		description    : 'HTML5 editor',
		defaultMessage : 'Editor'
	},
	menu_about:
	{
		id             : 'menu.about',
		description    : 'Whatever',
		defaultMessage : 'About'
	},
	menu_example:
	{
		id             : 'menu.example',
		description    : 'API usage examples',
		defaultMessage : 'Example'
	},
	menu_components_showcase:
	{
		id             : 'menu.components_showcase',
		description    : 'The section shows various React components in action',
		defaultMessage : 'React components showcase'
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
		store   : PropTypes.object.isRequired
	}

	componentDidMount()
	{
		// window.client_side_routing = true
	}

	componentWillUnmount()
	{
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
		const translate = this.props.intl.formatMessage

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

		const menu_items =
		[{
			name: translate(messages.menu_editor),
			link: '/editor'
		}, {
			name: translate(messages.menu_about),
			link: '/about'
		}, {
			name: translate(messages.menu_example),
			link: '/example'
		}, {
			name: translate(messages.menu_components_showcase),
			link: '/showcase'
		}]

		const markup = 
		(
			<div>
				{webpage_head(title, description, meta)}

				{/* header */}
				<header>
					{/* language chooser */}
					<Locale_switcher style={style.locale_switcher}/>

					{/* menu button for small screens */}
					<Menu_button toggle={::this.toggle_menu}/>

					{/* home page link */}
					<div className="logo" style={{ textAlign: 'center' }}>
						<IndexLink to="/" style={style.home} activeStyle={style.home.active}>
							{translate(messages.title)}
						</IndexLink>
					</div>

					{/* Navigation */}
					{/*<nav>*/}
						{/* main menu */}
						<Menu show={this.state.show_menu} toggle={::this.toggle_menu} items={menu_items}/>
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