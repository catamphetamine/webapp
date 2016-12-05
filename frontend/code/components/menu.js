import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'

import { Link } from 'react-router'

import styler from 'react-styling'
import classNames from 'classnames'

export default class Menu extends Component
{
	state = {}

	static propTypes =
	{
		show         : PropTypes.bool,
		show_while   : PropTypes.bool,
		toggle       : PropTypes.func,
		update_width : PropTypes.func,
		style        : PropTypes.object
	}

	static contextTypes =
	{
		history : PropTypes.object
	}

	constructor(props, context)
	{
		super(props, context)

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
		let markup

		const menu_style = this.props.style ? { ...style.menu, ...this.props.style } : style.menu

		if (exists(this.props.show))
		{
			markup =
			(
				<nav className={classNames('nav-collapsible', { 'nav-collapsible-shown': this.props.show_while })}>
					{/* style={{ position: 'relative' }}

					<button className="menu-close">
						<svg viewbox="0 0 40 40">
							<path d="M 10,10 L 30,30 M 30,10 L 10,30" stroke-width="3"/>
						</svg>
					</button>*/}

					<ul ref={ref => this.menu = ref} style={menu_style} className={classNames('menu', 'menu-collapsible', { 'menu-shown': this.props.show_while })}>
						{this.render_menu_items()}
					</ul>
				</nav>
			)
		}
		else
		{
			markup =
			(
				<nav className="nav-widescreen">
					<ul style={menu_style} className="menu">
						{this.render_menu_items()}
					</ul>
				</nav>
			)
		}

		return markup
	}

	render_menu_items()
	{
		return this.props.items.map((item, i) => (
			<li key={i} style={style.menu.item}>
				<Link
					to={item.link}
					style={style.menu.item.link}
					activeClassName="menu-item-selected"
					className="menu-item">
					{item.name}
				</Link>
			</li>
		))
	}

	// calculate_height()
	// {
	// 	const dom_node = ReactDOM.findDOMNode(this.menu)
	//
	// 	this.setState({ height: this.props.show ? dom_node.scrollHeight : 0 })
	// }

	calculate_width()
	{
		const dom_node = ReactDOM.findDOMNode(this.menu)

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
		// display: inline-block

		margin-top    : 0
		margin-bottom : 0

		list-style-type : none
		padding         : 0

		item
			// display: inline-block

			link
				// display         : inline-block
				display : block
				text-decoration : none
`