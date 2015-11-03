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

		const item_list = list.filter(({ key }) => key !== selected)

		const markup = 
		(
			<div style={this.props.style ? extend(style.wrapper, this.props.style) : style.wrapper} className="dropdown">

				{/* list container */}
				<div style={this.state.active ? style.container.expanded : style.container}>

					{/* currently selected item label */}
					{this.render_selected_item()}

					{/* a placeholder to make the parent <div/> take the whole width */}
					<ul ref="list" style={style.list.placeholder} className="dropdown-item-list">
						{item_list.filter(({ key }) => key !== selected).map(({ key, value, icon }, index) => this.render_list_item(key, value, icon))} {/*, index === 0, index === item_list.length - 1*/}
					</ul>

					{/* a list to select from */}
					<ul ref="list" style={this.state.active ? style.list.expanded : style.list} className="dropdown-item-list">
						{item_list.filter(({ key }) => key !== selected).map(({ key, value, icon }, index) => this.render_list_item(key, value, icon))} {/*, index === 0, index === item_list.length - 1*/}
					</ul>
				</div>

				{/* some kind of an arrow */}
				{/*<div style={this.state.active ? style.arrow.expanded : style.arrow}/>*/}
			</div>
		)

		return markup
	}

	render_list_item(key, value, icon) // , first, last
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

		const markup =
		(
			<li key={key}><button onClick={event => this.item_clicked(key, value, event)} style={item_style} className="dropdown-item">{icon}{value}</button></li>
		)

		return markup
	}

	render_selected_item()
	{
		if (!this.props.selected)
		{
			return false
		}

		const selected = this.props.list.filter(x => x.key === this.props.selected)[0]

		const markup =
		(
			<button onClick={this.toggle} style={style.selected_item_label} className="dropdown-item-selected">{selected.icon}{selected.value}</button>
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
		vertical-align : bottom

	container
		position : relative
		margin   : 0 auto

		// outline : none

		&expanded
			// color : #29ADFF

	selected_item_label
		width      : 100%
		text-align : left

	// arrow
	// 	width        : 0
	// 	height       : 0
	// 	position     : absolute
	// 	right        : 16px
	// 	top          : 50%
	// 	margin-top   : -6px
	// 	border-width : 6px 0 6px 6px
	// 	border-style : solid
	// 	border-color : transparent #fff

	// 	&expanded
	// 		border-color : #9bc7de transparent
	// 		border-width : 6px 6px 0 6px 
	// 		margin-top   : -3px
  
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