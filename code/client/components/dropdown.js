import React, { Component, PropTypes } from 'react'
import styler from 'react-styling'

export default class Flag extends Component
{
	static propTypes =
	{
		list     : PropTypes.array.isRequired,
		label    : PropTypes.string,
		selected : PropTypes.any,
		select   : PropTypes.func.isRequired
	}

	state = { active: false }

	constructor(props)
	{
		super(props)

		this.toggle           = this.toggle.bind(this)
		// this.item_clicked     = this.item_clicked.bind(this)
		this.document_clicked = this.document_clicked.bind(this)
	}

	componentDidMount()
	{
		document.addEventListener('click', this.document_clicked)
	}

	componentWillUnmount()
	{
		document.removeEventListener('click', this.document_clicked)
	}

	render()
	{
		const { list, selected, label } = this.props

		// { label ? (<span>{label}</span>) : false }

		// const item_list = list.filter(({ key }) => key !== selected)

		const markup = 
		(
			<div style={ this.props.style ? extend(style.wrapper, this.props.style) : style.wrapper } className="dropdown">

				{/* list container */}
				<div style={ this.state.active ? style.container.expanded : style.container }>

					{/* currently selected item label */}
					{ this.render_selected_item() }

					{/* a placeholder to make the parent <div/> take the whole width */}
					<ul ref="list" style={style.list.placeholder} className="dropdown-item-list">
						{ list.map(({ key, label, icon }, index) => this.render_list_item(key, label, icon))} {/*, index === 0, index === item_list.length - 1*/ }
					</ul>

					{/* a list to select from */}
					<ul ref="list" style={ this.state.active ? style.list.expanded : style.list } className="dropdown-item-list">
						{ list.filter(({ key }) => key !== selected).map(({ key, label, icon }, index) => this.render_list_item(key, label, icon))}
					</ul>
				</div>
			</div>
		)

		return markup
	}

	render_list_item(key, label, icon) // , first, last
	{
		let item_style = style.list.item

		// if (first && last)
		// {
		// 	item_style = item_style.single
		// }
		// else if (first)
		// {
		// 	item_style = item_style.first
		// }
		// else if (last)
		// {
		// 	item_style = item_style.last
		// }

		const list_item_style = (key === this.props.selected) ? { maxHeight: 0, overflow: 'hidden', textAlign: 'left' } : { textAlign: 'left' } 

		const markup =
		(
			<li key={key} style={list_item_style}><button onClick={event => this.item_clicked(key, label, event)} style={item_style} className="dropdown-item">{icon}{label}</button></li>
		)

		return markup
	}

	render_selected_item()
	{
		// if (!this.props.selected)
		// {
		// 	return false
		// }

		const selected = this.props.list.filter(x => x.key === this.props.selected)[0]

		const markup =
		(
			<button onClick={this.toggle} style={style.selected_item_label} className="dropdown-item-selected">
				{ selected ? <span>{selected.icon}{selected.label}</span> : this.props.label }

				{/* an arrow */}
				<div className="dropdown-arrow" style={ this.state.active ? style.arrow.expanded : style.arrow }/>
			</button>
		)

		return markup
	}

	toggle(event)
	{
		// event.stopPropagation() // doesn't work
		event.nativeEvent.stopImmediatePropagation()

		this.setState({ active: !this.state.active })
	}

	item_clicked(key, event)
	{
		if (key === this.props.selected)
		{
			return
		}

		this.props.select(key)
	}

	document_clicked(event)
	{
		this.setState({ active: false })
	}
}

const style = styler
`
	wrapper
		display        : inline-block
		vertical-align : bottom

	container
		position : relative
		margin   : 0 auto

		&expanded

	selected_item_label
		width      : 100%
		text-align : left

	arrow
		display  : inline-block

		width        : 0
		height       : 0

		margin-left   : 0.2em
		margin-bottom : 0.15em

		border-width : 0.23em 0.23em 0 0.23em 

		border-style       : solid
		border-left-color  : transparent
		border-right-color : transparent

		&expanded
  
	list
		position : absolute

		margin          : 0
		padding         : 0
		list-style-type : none

		background : white

		// Hiding
		opacity        : 0
		pointer-events : none

		// transition: all 300ms ease-out

		// max-height : 0
		// overflow   : hidden

		&expanded
			opacity        : 1
			pointer-events : auto

			// max-height : 100px

		&placeholder
			position            : static
			max-height          : 0
			border-top-width    : 0
			border-bottom-width : 0
			opacity             : 1
			visibility          : hidden

		item
			display     : inline-block
			white-space : nowrap
`