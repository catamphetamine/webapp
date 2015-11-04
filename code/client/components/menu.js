import React, { Component } from 'react'
import ReactDOM from 'react-dom'

import { Link } from 'react-router'

import styler from 'react-styling'

import { defineMessages, injectIntl as international } from 'react-intl'

const messages = defineMessages
({
	editor:
	{
		id             : 'menu.editor',
		description    : 'HTML5 editor',
		defaultMessage : 'Editor'
	},
	about:
	{
		id             : 'menu.about',
		description    : 'Whatever',
		defaultMessage : 'About'
	},
	example:
	{
		id             : 'menu.example',
		description    : 'API usage examples',
		defaultMessage : 'Example'
	},
	components_showcase:
	{
		id             : 'menu.components_showcase',
		description    : 'The section shows various React components in action',
		defaultMessage : 'React components showcase'
	}
})

export default class Menu extends Component
{
	state = {}
	
	componentDidUpdate(previous_props, previous_state)
	{
		if (this.props.show !== previous_props.show)
		{
			this.calculate_height()
		}
	}

	render()
	{
		const translate = this.props.intl.formatMessage

		const markup =
		(
			<ul ref="menu" style={ this.props.show ? merge(style.menu, { maxHeight: this.state.height + 'px' }) : style.menu } className={'menu' + ' ' + (this.props.show ? 'menu-shown' : '')}>
				<li style={style.menu.item}><Link to="/editor"   style={style.menu.item.link} activeClassName="menu-item-selected" className="menu-item">{translate(messages.editor)}</Link></li>
				<li style={style.menu.item}><Link to="/about"    style={style.menu.item.link} activeClassName="menu-item-selected" className="menu-item">{translate(messages.about)}</Link></li>
				<li style={style.menu.item}><Link to="/example"  style={style.menu.item.link} activeClassName="menu-item-selected" className="menu-item">{translate(messages.example)}</Link></li>
				<li style={style.menu.item}><Link to="/showcase" style={style.menu.item.link} activeClassName="menu-item-selected" className="menu-item">{translate(messages.components_showcase)}</Link></li>
			</ul>
		)

		return markup
	}

	calculate_height()
	{
		const dom_node = ReactDOM.findDOMNode(this.refs.menu)

		this.setState({ height: this.props.show ? dom_node.scrollHeight : 0 })
	}
}

export default international(Menu)

const style = styler
`
	menu
		display : inline-block

		margin-top    : 0
		margin-bottom : 0

		list-style-type : none
		padding         : 0

		item
			display: inline-block

			link
				display         : inline-block
				text-decoration : none
`