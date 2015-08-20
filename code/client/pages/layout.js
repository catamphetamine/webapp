import React, { Component, PropTypes } from 'react'
import DocumentMeta from 'react-document-meta'

// использование: @Radium перед классом компонента
// Radium = require 'radium'

import { Link } from 'react-router'
import styler from 'react-styling'

import { bindActionCreators as bind_action_creators } from 'redux'
import { logout } from '../actions/authentication'

import { create_transition_hook } from '../../react-isomorphic-render/router'

import { connect } from 'react-redux'

// import {isLoaded as isAuthLoaded} from '../flux/stores/auth'

import Locale_switcher from '../components/locale switcher'

@connect
(
	store => ({ }), // user: store.auth.user })
	dispatch => bind_action_creators({ logout }, dispatch)
)
export default class Layout extends Component
{
	static propTypes =
	{
		children : PropTypes.object.isRequired,
		user     : PropTypes.object,
		logout   : PropTypes.func.isRequired
	}

	static contextTypes =
	{
		router: PropTypes.object.isRequired,
		store: PropTypes.object.isRequired
	}

	componentWillMount()
	{
		const {router, store} = this.context
		this.transition_hook = create_transition_hook(store)
		router.addTransitionHook(this.transition_hook)
	}

	componentWillUnmount()
	{
		const {router, store} = this.context
		router.remove_transition_hook(this.transition_hook)
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
		// Html document metadata

		const title = 'Cinema'
		const description = 'A video production studio'

		const meta =
		{
			title,
			description,
			meta:
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
				<DocumentMeta {...meta}/>

				<nav>
					<Link to="/" style={style.home} activeStyle={style.home}>
						Cinema
					</Link>

					<Locale_switcher style={style.locale_switcher}/>

					<ul style={style.menu}>
						<li style={style.menu.item}><Link to="/editor" style={style.menu.item.link} activeStyle={style.menu.item.link.current}>{'Editor'}</Link></li>
						<li style={style.menu.item}><Link to="/about" style={style.menu.item.link} activeStyle={style.menu.item.link.current}>{'About'}</Link></li>
						<li style={style.menu.item}><Link to="/showcase" style={style.menu.item.link} activeStyle={style.menu.item.link.current}>{'Showcase'}</Link></li>
					</ul>
				</nav>

				{this.props.children}

				<footer></footer>
			</div>
		)

		return markup
	}
}

const style = styler
`
	home
		color       : black
		font-size   : 16pt
		margin-left : 1em

	locale_switcher
		display     : inline-block
		margin-left : 3em

	menu
		list-style-type: none

		item
			display: inline-block

			link
				display         : inline-block
				text-decoration : none
				color           : #000000

				padding-left    : 0.4em
				padding-right   : 0.4em
				padding-top     : 0.2em
				padding-bottom  : 0.2em

				&current
					color            : #ffffff
					background-color : #000000
`