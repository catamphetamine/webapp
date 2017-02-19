import React, { Component, PropTypes } from 'react'
// import { StickyContainer, Sticky } from 'react-sticky'
import { PageAndMenu, Page, Menu, MenuButton, Snackbar, DragAndDrop } from 'react-responsive-ui'
import { flat as style }                  from 'react-styling'
import { preload, Title, Meta, Link, IndexLink } from 'react-isomorphic-render'
import { connect }                        from 'react-redux'
import { defineMessages }                 from 'react-intl'
import classNames                         from 'classnames'

import international   from '../international/internationalize'
import Locale_switcher from '../components/locale switcher'
import User_bar        from '../components/user bar'
import Preloading      from '../components/preloading'

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
	static propTypes =
	{
		snack : PropTypes.object
	}

	static defaultProps =
	{
		snack : {}
	}

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
		const { translate, isDragging, snack, locale, children } = this.props

		const title       = translate(messages.title)
		const description = translate(messages.description)

		// <head/> <meta/> tags
		const meta =
		[
			// <meta charset="utf-8"/>
			{ charset: 'utf-8' },

			// <meta name="..." content="..."/>
			//
			// i don't fully understand what it does
			// https://css-tricks.com/probably-use-initial-scale1/
			//
			// user-scalable=no removes touch event delay ~300ms
			//
			{ name: 'viewport', content: 'width=device-width, initial-scale=1.0, user-scalable=no' },

			// <meta property="..." content="..."/>
			{ property: 'og:title',       content: title },
			{ property: 'og:site_name',   content: title },
			{ property: 'og:locale',      content: locale },
			{ property: 'og:description', content: description }
		]

		const markup =
		(
			<PageAndMenu
				className={classNames('layout', { 'layout--dragging': isDragging })}>

				<Title>{ title }</Title>
				<Meta>{ meta }</Meta>

				{/* navigation for small screens (will slide out) */}
				{/* main menu */}
				<Menu slideout items={menu_entries(translate)} itemComponent={Menu_item}/>

				{/* "page is preloading" spinner */}
				<Preloading/>

				{/* An application-wide global snackbar */}
				<Snackbar value={snack.text} reset={this.reset_snack}/>

				{/* webpage */}
				{/* <StickyContainer className="page" style={styles.page}> */}
				<Page className="page">
					{/* header */}
					{/* <Sticky> */}
						<header className="card rrui__fixed-full-width">
							{/* menu button for small screens */}
							<div className="menu-button-container">
								<MenuButton link="/menu"/>
							</div>

							{/* home page link */}
							<div className="logo" style={{ textAlign: 'center' }}>
								<IndexLink to="/" style={styles.home} activeStyle={styles.home_active}>
									{translate(messages.title)}
								</IndexLink>
							</div>

							{/* navigation for wide screens */}
							{/* main menu */}
							<Menu items={menu_entries(translate)} itemComponent={Menu_item}/>

							{/* User accout section */}
							<User_bar/>
						</header>
					{/* </Sticky> */}

					{/* page content */}
					{ children }

					<footer>
						<div><a href="https://github.com/halt-hammerzeit">halt-hammerzeit@github.com</a></div>

						{/* language chooser */}
						<div className="language-wrapper">
							<Locale_switcher alignment="right" upward={true} style={styles.locale_switcher}/>
						</div>
					</footer>
				</Page>
				{/* </StickyContainer> */}
			</PageAndMenu>
		)

		return markup
	}
}

export const messages = defineMessages
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
	menu_log:
	{
		id             : 'menu.log',
		description    : 'The section shows log messages from all the parts of the application',
		defaultMessage : 'Log'
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

	menu_item_link
`

function Menu_item({ to, children })
{
	const markup =
	(
		<Link
			to={ to }
			style={ styles.menu_item_link }
			className="rrui__menu__item"
			activeClassName="rrui__menu__item--selected">
			{ children }
		</Link>
	)

	return markup
}

export function menu_entries(translate)
{
	return [{
		name: translate(messages.menu_log),
		link: '/logs'
	}]
}