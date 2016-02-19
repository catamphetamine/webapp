import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'
import { PropTypes as React_router_prop_types } from 'react-router'

import { Link } from 'react-router'

import styler from 'react-styling'

export default class Menu extends Component
{
	state = {};

	static propTypes = 
	{
		show         : PropTypes.bool,
		show_while   : PropTypes.bool,
		toggle       : PropTypes.func,
		update_width : PropTypes.func,
		style        : PropTypes.object
	};

	static contextTypes =
	{
		history : React_router_prop_types.history
	};

	constructor(props)
	{
		super(props)

		// this.document_clicked = this.document_clicked.bind(this)
	}

	componentDidMount()
	{
		if (!exists(this.props.show))
		{
			return
		}

		if (this.context.history)
		{
			this.unlisten_history = this.context.history.listen(location =>
			{
				if (this.props.show)
				{
					this.props.toggle()
				}
			})
		}

		this.calculate_width()

		// document.addEventListener('click', this.document_clicked)
	}

	componentDidUpdate(previous_props, previous_state)
	{
		if (this.props.show !== previous_props.show)
		{
			// this.calculate_height()
			this.calculate_width()
		}
	}

	componentWillUnmount()
	{
		if (!exists(this.props.show))
		{
			return
		}

		if (this.unlisten_history)
		{
			this.unlisten_history()
		}

		// document.removeEventListener('click', this.document_clicked)
	}

	render()
	{
		// const markup =
		// (
		// 	<ul ref="menu" style={ this.props.show ? merge(style.menu, { maxHeight: this.state.height + 'px' }) : style.menu } className={'menu' + ' ' + (this.props.show ? 'menu-shown' : '')}>
		// 		{ this.props.items.map((item, i) => <li key={i} style={style.menu.item}><Link to={item.link} style={style.menu.item.link} activeClassName="menu-item-selected" className="menu-item">{item.name}</Link></li>) }
		// 	</ul>
		// )

		let markup

		const menu_style = this.props.style ? merge(style.menu, this.props.style) : style.menu

		if (exists(this.props.show))
		{
			markup =
			(
				<ul ref="menu" style={menu_style} className={'menu' + ' ' + 'menu-collapsible' + ' ' + (this.props.show_while ? 'menu-shown' : '')}>
					{ this.props.items.map((item, i) => <li key={i} style={style.menu.item}><Link to={item.link} style={style.menu.item.link} activeClassName="menu-item-selected" className="menu-item">{item.name}</Link></li>) }
				</ul>
			)
		}
		else
		{
			markup =
			(
				<ul style={menu_style} className="menu">
					{ this.props.items.map((item, i) => <li key={i} style={style.menu.item}><Link to={item.link} style={style.menu.item.link} activeClassName="menu-item-selected" className="menu-item">{item.name}</Link></li>) }
				</ul>
			)
		}

		return markup
	}

	// calculate_height()
	// {
	// 	const dom_node = ReactDOM.findDOMNode(this.refs.menu)

	// 	this.setState({ height: this.props.show ? dom_node.scrollHeight : 0 })
	// }

	calculate_width()
	{
		const dom_node = ReactDOM.findDOMNode(this.refs.menu)

		this.props.update_width(dom_node.offsetWidth)
	}

	// document_clicked(event)
	// {
	// 	if (event.target.className === 'menu-icon' 
	// 		|| event.target.className === 'menu-item'
	// 		|| event.target.className === 'menu-button')
	// 	{
	// 		return
	// 	}

	// 	if (this.props.show)
	// 	{
	// 		this.props.toggle()
	// 	}
	// }
}

const style = styler
`
	menu
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