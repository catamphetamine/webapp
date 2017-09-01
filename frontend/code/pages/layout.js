import React, { Component, PropTypes } from 'react'
// import { StickyContainer, Sticky } from 'react-sticky'
import { PageAndMenu, Page, CollapsibleMenu, MenuButton, Snackbar, DragAndDrop } from 'react-responsive-ui'
import { flat as style }                  from 'react-styling'
import { preload, Title, Meta, IndexLink } from 'react-isomorphic-render'
import { connect }                        from 'react-redux'
import { defineMessages }                 from 'react-intl'
import classNames                         from 'classnames'

import international   from '../international/internationalize'
import Locale_switcher from '../components/locale switcher'
import User_bar        from '../components/user bar'
import Preloading      from '../components/preloading'
import Menu            from '../components/menu'
import default_messages from '../components/messages'

import { snack as set_snack } from '../redux/snackbar'

@connect
(
	({ locale, snackbar }) =>
	({
		locale : locale.locale,
		snack  : snackbar.snack
	}),
	{
		set_snack
	}
)
@international
@DragAndDrop()
export default class Layout extends Component
{
	constructor()
	{
		super()

		this.reset_snack = this.reset_snack.bind(this)
	}

	reset_snack()
	{
		const { set_snack } = this.props

		set_snack()
	}

	render()
	{
		const
		{
			translate,
			isDragging,
			snack,
			locale,
			children
		}
		= this.props

		const title       = translate(default_messages.title)
		const description = translate(messages.description)

		const markup =
		(
			<PageAndMenu
				className={ classNames('layout', { 'layout--dragging': isDragging }) }>

				<Title>{ title }</Title>

				<Meta>
					<meta charset="utf-8"/>
					{/*
					https://css-tricks.com/probably-use-initial-scale1/
					They say: "user-scalable=no removes touch event delay ~300ms"
					*/}
					{/*
					This also makes the page not scale down on mobile devices
					and instead adapt to the screen width using `@media` queries.
					*/}
					<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no"/>

					{/* OpenGraph metadata (ogp.me) */}
					<meta property="og:title" content={ title }/>
					<meta property="og:site_name" content={ title }/>
					<meta property="og:description" content={ description }/>
					{/* <meta property="og:locale" content={ locale.replace('-', '_') }/> */}
				</Meta>

				{/* navigation for small screens (will slide out) */}
				{/* main menu */}
				<CollapsibleMenu>
					<Menu/>
				</CollapsibleMenu>

				{/* "page is preloading" spinner */}
				<Preloading/>

				{/* An application-wide global snackbar */}
				<Snackbar value={ snack } reset={ this.reset_snack }/>

				{/* webpage */}
				{/* <StickyContainer className="page" style={styles.page}> */}
				<Page className="page">
					{/* header */}
					{/* <Sticky> */}
						<nav className="main-header card rrui__fixed-full-width">
							{/* menu button for small screens */}
							<div className="menu-button-container">
								<MenuButton link="/menu"/>
							</div>

							{/* home page link */}
							<div className="logo" style={{ textAlign: 'center' }}>
								<IndexLink to="/" style={ styles.home } activeStyle={ styles.home_active }>
									{ translate(default_messages.title) }
								</IndexLink>
							</div>

							{/* navigation for wide screens */}
							{/* main menu */}
							<Menu className="rrui__menu"/>

							{/* User accout section */}
							<User_bar/>
						</nav>
					{/* </Sticky> */}

					{/* page content */}
					{ children }

					<footer>
						<div>
							<a href={ `mailto:${configuration.support.email}` }>
								{ configuration.support.email }
							</a>
						</div>

						{/* language chooser */}
						<div className="language-wrapper">
							<Locale_switcher alignment="right" upward style={ styles.locale_switcher }/>
						</div>
					</footer>
				</Page>
				{/* </StickyContainer> */}
			</PageAndMenu>
		)

		return markup
	}
}

const messages = defineMessages
({
	description:
	{
		id             : 'application.description',
		description    : 'Web application description',
		defaultMessage : 'A generic web application boilerplate'
	}
})

const styles = style
`
	home
		text-decoration : none
		color : inherit

		active
			cursor : default
			color  : inherit
`