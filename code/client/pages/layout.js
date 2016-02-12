import React, { Component, PropTypes } from 'react'

import { bindActionCreators as bind_action_creators } from 'redux'

// testing `flat` styler
import styler              from 'react-styling/flat'
import { preload }         from 'react-isomorphic-render/redux'
import { connect }         from 'react-redux'
import { Link, IndexLink } from 'react-router'
import { defineMessages }  from 'react-intl'
import { head }            from 'react-isomorphic-render'

// import autoprefixer from 'autoprefixer'

import international   from '../international/internationalize'

import Menu            from '../components/menu'
import Menu_button     from '../components/menu button'
import Locale_switcher from '../components/locale switcher'
import Authentication  from '../components/authentication'
import Preloading      from '../components/preloading'

import { authenticate } from '../actions/authentication'

// when adjusting this transition time also adjust it in styles/xs-m.scss
const menu_transition_duration = 210 // milliseconds

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
	// menu_about:
	// {
	// 	id             : 'menu.about',
	// 	description    : 'Whatever',
	// 	defaultMessage : 'About'
	// },
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

@preload
({
	blocking: (dispatch, get_model) => dispatch(authenticate())
})
@international()
export default class Layout extends Component
{
	state = 
	{
		show_menu  : false,
		menu_width : 0,

		page_moved_aside : false
	};

	static propTypes =
	{
		children : PropTypes.node.isRequired
	};

	render()
	{
		const translate = this.props.intl.formatMessage

		// Html document metadata

		const title = 'WebApp'
		const description = 'A generic web application boilerplate'

		const meta =
		{
			charSet: 'utf-8',
			name:
			{
				// i don't fully understand what it does
				// https://css-tricks.com/probably-use-initial-scale1/
				//
				// user-scalable=no removes touch event delay ~300ms
				//
				viewport: 'width=device-width, initial-scale=1.0, user-scalable=no'
			},
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

		const menu_items =
		[{
		// 	name: translate(messages.menu_editor),
		// 	link: '/editor'
		// }, {
		// 	name: translate(messages.menu_about),
		// 	link: '/about'
		// }, {
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
				{head(title, description, meta)}

				{/* Navigation */}
				{/*<nav>*/}
					{/* main menu */}
					<Menu show={this.state.page_moved_aside} toggle={::this.toggle_menu} update_width={::this.update_menu_width} items={menu_items}/>
				{/*</nav>*/}
    
				<div className="page" style={ this.state.show_menu ? merge(style.page, { transform: `translate3d(${this.state.menu_width}px, 0px, 0px)` }) : style.page }>
					{/* "page is preloading" spinner */}
					<Preloading/>

					{/* header */}
					<header>
						{/* menu button for small screens */}
						<div className="menu-button-container">
							<Menu_button toggle={::this.toggle_menu}/>
						</div>

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

						{/* login */}
						<Authentication/>
					</header>

					{this.props.children}

					<footer>
						<div><a href="https://github.com/halt-hammerzeit">halt-hammerzeit@github.com</a></div>

						{/* language chooser */}
						<div className="language-wrapper">
							<Locale_switcher upward={true} style={style.locale_switcher}/>
						</div>
					</footer>
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
			menu_transition_duration)
		})
	}

	update_menu_width(width)
	{
		this.setState({ menu_width: width })
	}
}

const style = styler
`
	page
		position : relative
		z-index  : 0 // 1
		transition-duration : ${menu_transition_duration}ms

	home
		text-decoration : none

		active
			cursor : default
			color  : inherit
`