import React, { Component, PropTypes } from 'react'
// import { StickyContainer, Sticky } from 'react-sticky'

// testing `flat` styler
import styler              from 'react-styling/flat'
import { preload, head }   from 'react-isomorphic-render'
import { connect }         from 'react-redux'
import { Link, IndexLink } from 'react-router'
import { defineMessages }  from 'react-intl'
import classNames          from 'classnames'

import international   from '../international/internationalize'

import { PageAndMenu, Page, Menu, MenuButton, Snackbar } from 'react-responsive-ui'

import Locale_switcher from '../components/locale switcher'
import User_bar        from '../components/user bar'
import Preloading      from '../components/preloading'

import HTML5Backend                   from 'react-dnd-html5-backend'
import { DragDropContext, DragLayer } from 'react-dnd'

@connect
(
	model =>
	({
		locale : model.locale.locale,
		snack  : model.snackbar.snack
	}),
	dispatch => ({ dispatch })
)
@international()
@DragDropContext(HTML5Backend)
@DragLayer(monitor =>
({
	// item           : monitor.getItem(),
	// item_type      : monitor.getItemType(),
	// current_offset : monitor.getSourceClientOffset(),
	is_dragging    : monitor.isDragging()
}))
export default class Layout extends Component
{
	static propTypes =
	{
		// item: PropTypes.object,
		// item_type: PropTypes.string,
		// current_offset: PropTypes.shape
		// ({
		// 	x: PropTypes.number.isRequired,
		// 	y: PropTypes.number.isRequired
		// }),

		is_dragging : PropTypes.bool.isRequired,

		locale : PropTypes.string.isRequired,
		snack  : PropTypes.oneOfType([PropTypes.string, PropTypes.object])
	}

	static defaultProps =
	{
		snack : {}
	}

	constructor(props, context)
	{
		super(props, context)

		this.reset_snack = this.reset_snack.bind(this)
	}

	reset_snack()
	{
		this.props.dispatch({ type: 'snack: reset' })
	}

	render()
	{
		const { translate, is_dragging, snack, locale } = this.props

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
				className={classNames('layout', { 'layout--dragging': is_dragging })}>

				{/* <head/> */}
				{head(title, meta)}

				{/* navigation for small screens (will slide out) */}
				{/* main menu */}
				<Menu slideout items={menu_entries(translate)}/>

				{/* "page is preloading" spinner */}
				<Preloading/>

				{/* An application-wide global snackbar */}
				<Snackbar value={snack.text} reset={this.reset_snack}/>

				{/* webpage */}
				{/* <StickyContainer className="page" style={style.page}> */}
				<Page className="page">
					{/* header */}
					{/* <Sticky> */}
						<header className="card">
							{/* menu button for small screens */}
							<div className="menu-button-container">
								<MenuButton link="/menu"/>
							</div>

							{/* home page link */}
							<div className="logo" style={{ textAlign: 'center' }}>
								<IndexLink to="/" style={style.home} activeStyle={style.home_active}>
									{translate(messages.title)}
								</IndexLink>
							</div>

							{/* navigation for wide screens */}
							{/* main menu */}
							<Menu items={menu_entries(translate)}/>

							{/* User accout section */}
							<User_bar/>
						</header>
					{/* </Sticky> */}

					{/* page content */}
					{this.props.children}

					<footer>
						<div><a href="https://github.com/halt-hammerzeit">halt-hammerzeit@github.com</a></div>

						{/* language chooser */}
						<div className="language-wrapper">
							<Locale_switcher alignment="right" upward={true} style={style.locale_switcher}/>
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

const style = styler
`
	home
		text-decoration : none

		active
			cursor : default
			color  : inherit
`

export function menu_entries(translate)
{
	return [{
		name: translate(messages.menu_example),
		link: '/example/simple'
	}, {
		name: translate(messages.menu_components_showcase),
		link: '/showcase'
	}, {
		name: translate(messages.menu_log),
		link: '/logs'
	}]
}