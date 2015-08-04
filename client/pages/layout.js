import React, { Component, PropTypes } from 'react'

// использование: @Radium перед классом компонента
// Radium = require 'radium'

import { Link } from 'react-router'
import styler from 'react-styling'

import { create_transition_hook } from '../router'

import { connect } from 'react-redux'

// import {isLoaded as isAuthLoaded} from '../flux/stores/auth'
// import {load as loadAuth} from '../flux/actions/authActions'

class Layout extends Component
{
	// static propTypes =
	// {
	// 	user: PropTypes.object,
	// 	logout: PropTypes.func
	// }

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

	// handleLogout(event)
	// {
	// 	event.preventDefault()
	// 	this.props.logout()
	// }

	render()
	{
		// const {user} = this.props

		const markup = 
		(
			<div>
				<nav>
					<Link to="/">
						Cinema
					</Link>

					<ul style={style.menu}>
						<li style={style.menu.item}><Link to="/editor" style={style.menu.item.link} activeStyle={style.menu.item.link.current}>{'Editor'}</Link></li>
						<li style={style.menu.item}><Link to="/about" style={style.menu.item.link} activeStyle={style.menu.item.link.current}>{'About'}</Link></li>
						<li style={style.menu.item}><Link to="/showcase" style={style.menu.item.link} activeStyle={style.menu.item.link.current}>{'Showcase'}</Link></li>
					</ul>
				</nav>

				<div>
					{this.props.children}
				</div>

				<footer></footer>
			</div>
		)

		return markup
	}
}

const style = styler
`
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

@connect(store => ({
	// user: store.auth.user
}))
export default class Reduxed
{
	static propTypes =
	{
		// user: PropTypes.object,
		dispatch: PropTypes.func.isRequired
	}

	// static preload(store)
	// {
	// 	const promises = []
	// 	if (!isAuthLoaded(store.getState())){
	// 		promises.push(store.dispatch(loadAuth()))
	// 	}
	// 	return Promise.all(promises)
	// }

	render()
	{
		const { user, dispatch } = this.props  // user={user}
		// {...bindActionCreators(authActions, dispatch)}
		const markup = 
		(
			<Layout>
				{this.props.children}
			</Layout>
		)

		return markup
	}
}