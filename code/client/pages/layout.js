import React, { Component, PropTypes } from 'react'
import { webpage_head } from '../webpage head'

// использование: @Radium перед классом компонента
// Radium = require 'radium'

import { Link, IndexLink } from 'react-router'

// testing `flat` styler
import styler from 'react-styling/flat'

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

// when adjusting this transition time also adjust it in styles/xs-m.scss
const transition_duration = 210 // milliseconds

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
		defaultMessage : 'Showcase'
	},
	menu_log:
	{
		id             : 'menu.log',
		description    : 'The section shows log messages from all the parts of the application',
		defaultMessage : 'Log'
	}
})

@connect
(
	store => ({ }), // user: store.auth.user })
	dispatch => bind_action_creators({ logout }, dispatch)
)
class Layout extends Component
{
	state = 
	{
		show_menu  : false,
		menu_width : 0,

		page_moved_aside : false
	}

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
		}, {
			name: translate(messages.menu_log),
			link: '/logs'
		}]

		const markup = 
		(
			<div className={ this.state.page_moved_aside ? 'layout layout-with-page-aside' : 'layout' }>
				{webpage_head(title, description, meta)}

				{/* Navigation */}
				{/*<nav>*/}
					{/* main menu */}
					<Menu show={this.state.show_menu} toggle={::this.toggle_menu} update_width={::this.update_menu_width} items={menu_items}/>
				{/*</nav>*/}
    
				<div className="page" style={ this.state.show_menu ? merge(style.page, { transform: `translate3d(${this.state.menu_width}px, 0px, 0px)` }) : style.page }>
					{/* header */}
					<header>
						{/* language chooser */}
						<Locale_switcher style={style.locale_switcher}/>

						{/* menu button for small screens */}
						<Menu_button toggle={::this.toggle_menu}/>

						{/* home page link */}
						<div className="logo" style={{ textAlign: 'center' }}>
							<IndexLink to="/" style={style.home} activeStyle={style.home_active}>
								{translate(messages.title)}
							</IndexLink>
						</div>

						{/* Navigation */}
						{/*<nav>*/}
							{/* main menu */}
							<Menu items={menu_items}/>
						{/*</nav>*/}
					</header>

					{this.props.children}

					<footer></footer>
				</div>
			</div>
		)

		return markup
	}

	toggle_menu()
	{
		if (!this.state.show_menu)
		{
			return this.setState({ show_menu: !this.state.show_menu, page_moved_aside: !this.state.page_moved_aside })
		}

		this.setState({ show_menu: !this.state.show_menu }, () =>
		{
			setTimeout(() =>
			{
				this.setState({ page_moved_aside: this.state.show_menu })
			}, 
			transition_duration)
		})
	}

	update_menu_width(width)
	{
		this.setState({ menu_width: width })
	}
}

export default international(Layout)

const style = styler
`
	page
		position : relative
		z-index  : 1
		transition-duration : ${transition_duration}ms

	home
		text-decoration : none

		active
			cursor : default

	// locale_switcher
	// 	position : absolute
	// 	right    : 0
	// 	top      : 0
`