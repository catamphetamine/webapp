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
	static propTypes =
	{
		children : PropTypes.object.isRequired,
		user     : PropTypes.object,
		logout   : PropTypes.func.isRequired
	}

	static contextTypes =
	{
		// router : PropTypes.object.isRequired,
		history : PropTypes.object.isRequired,
		store   : PropTypes.object.isRequired
	}

	componentDidMount()
	{
		window.client_side_routing = true
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

				<nav>
					{/* header */}
					{/* http://stackoverflow.com/questions/1022795/vertically-align-floating-divs */}
					<table style={{ width: '100%' }}>
						<tbody>
							<tr>
								{/* aligned to the left */}
								<td style={{ verticalAlign: 'bottom' }}>
									{/* home page link */}
									<IndexLink to="/" style={style.home} activeStyle={style.home.active}>
										{format_message(messages.title)}
									</IndexLink>
								</td>

								{/* aligned to the right */}
								<td style={{ verticalAlign: 'bottom', textAlign: 'right' }}>
									{/* language chooser */}
									<Locale_switcher style={style.locale_switcher}/>
								</td>
							</tr>
						</tbody>
					</table>

					<ul style={style.menu} className="menu">
						<li style={style.menu.item}><Link to="/editor"   style={style.menu.item.link} activeClassName="menu-item-selected" className="menu-item">{'Editor'}</Link></li>
						<li style={style.menu.item}><Link to="/about"    style={style.menu.item.link} activeClassName="menu-item-selected" className="menu-item">{'About'}</Link></li>
						<li style={style.menu.item}><Link to="/example"  style={style.menu.item.link} activeClassName="menu-item-selected" className="menu-item">{'Example'}</Link></li>
						<li style={style.menu.item}><Link to="/showcase" style={style.menu.item.link} activeClassName="menu-item-selected" className="menu-item">{'React components showcase'}</Link></li>
					</ul>
				</nav>

				{this.props.children}

				<footer></footer>
			</div>
		)

		return markup
	}
}

export default international(Layout)

const style = styler
`
	home
		font-size   : 26pt
		margin-left : 0.5em
		text-decoration : none
		
		// border-bottom-width : 0.08em
		// border-bottom-style : dotted
		// border-bottom-color : black

		active:
			cursor              : default
			border-bottom-width : 0

	locale_switcher

	menu
		list-style-type : none
		padding         : 0

		item
			display: inline-block

			link
				display         : inline-block
				text-decoration : none
`