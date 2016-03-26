import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'
import styler from 'react-styling'

import { inject } from './common'

const scrollbar_width = '17px'
const add_padding_for_scrollbar = true
const show_selected_item_in_list = true

export default class Dropdown extends Component
{
	static propTypes =
	{
		options    : PropTypes.arrayOf
		(
			PropTypes.shape
			({
				value: React.PropTypes.string.isRequired,
				label: React.PropTypes.string.isRequired
			})
		)
		.isRequired,
		name       : PropTypes.string,
		label      : PropTypes.string,
		value      : PropTypes.any,
		on_change  : PropTypes.func.isRequired,
		validate   : PropTypes.func,

		upward     : PropTypes.bool,
		max_items  : PropTypes.number,

		transition_item_count_min : PropTypes.number,
		transition_duration_min : PropTypes.number,
		transition_duration_max : PropTypes.number
	}

	static defaultProps = 
	{
		max_items : 6,

		// transition_item_count_min : 3,
		transition_item_count_min : 1,
		transition_duration_min : 60, // milliseconds
		transition_duration_max : 100 // milliseconds
	}

	state = {}

	constructor(props)
	{
		super(props)

		inject(this)

		this.toggle           = this.toggle.bind(this)
		this.document_clicked = this.document_clicked.bind(this)
	}

	componentDidMount()
	{
		document.addEventListener('click', this.document_clicked)
	}

	componentDidUpdate(previous_props, previous_state)
	{
		if (this.state.expanded !== previous_state.expanded)
		{
			if (this.state.expanded && this.should_animate())
			{
				if (!exists(this.state.height))
				{
					this.calculate_height()
				}
			}
		}
	}

	componentWillUnmount()
	{
		document.removeEventListener('click', this.document_clicked)
	}

	render()
	{
		const { options, upward } = this.props

		const item_list = this.list_items()

		const list_style = clone(upward ? style.list.upward : style.list.downward)

		if (exists(this.state.list_height))
		{
			list_style.maxHeight = this.state.list_height + 'px'
		}

		const overflow = this.overflown()

		const markup = 
		(
			<div style={ this.props.style ? merge(style.wrapper, this.props.style) : style.wrapper } className={"rich dropdown" + " " + (upward ? "dropdown-upward" : "") + " " + (this.state.expanded ? "dropdown-expanded" : "dropdown-collapsed")}>

				{/* list container */}
				<div style={ this.state.expanded ? style.container.expanded : style.container }>

					{/* currently selected item label */}
					{ this.render_selected_item() }

					{/* a placeholder to make the parent <div/> take the whole width */}
					<ul style={style.list.placeholder} className="dropdown-item-list">
						{ options.map(({ value, label, icon }, index) => this.render_list_item(value, label, icon, overflow))} {/*, index === 0, index === item_list.length - 1*/ }
					</ul>

					{/* a list to select from */}
					{/* Math.max(this.state.height, this.props.max_height) */}
					<ul ref="list" style={list_style} className={'dropdown-item-list' + ' ' + (this.state.expanded ? 'dropdown-item-list-expanded' : '')}>
						{ item_list.map(({ value, label, icon }, index) => this.render_list_item(value, label, icon, overflow))}
					</ul>
				</div>

				{this.render_static()}
			</div>
		)

		return markup
	}

	render_list_item(value, label, icon, overflow) // , first, last
	{
		const is_selected = value === this.props.value

		let item_style = Object.clone(style.list.item)

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

		let list_item_style = { textAlign: 'left' } 

		if (!show_selected_item_in_list && is_selected)
		{
			list_item_style.maxHeight = 0
			list_item_style.overflow  = 'hidden'
		}

		// on overflow the vertical scrollbar will take up space
		// reducing padding-right and the only way to fix that
		// is to add additional padding-right
		//
		// a hack to restore padding-right taken up by a vertical scrollbar
		if (overflow && add_padding_for_scrollbar)
		{
			item_style.marginRight = scrollbar_width
			// list_item_style.paddingRight = scrollbar_width
		}

		const markup =
		(
			<li key={value} style={list_item_style}>
				<button onClick={event => this.item_clicked(value, event)} style={item_style} className={ "dropdown-item " + (is_selected ? 'dropdown-item-selected-in-list' : '') }>
					<span className="dropdown-item-icon">{icon}</span>
					<span className="dropdown-item-label">{label}</span>
				</button>
			</li>
		)

		return markup
	}

	render_selected_item()
	{
		const selected = this.props.options.filter(x => x.value === this.props.value)[0]

		let label

		if (selected)
		{
			label = 
			(
				<span>
					<span className="dropdown-item-icon">{selected.icon}</span>
					<span className="dropdown-item-label">{selected.label}</span>
				</span>
			)
		}
		else
		{
			label = <span className="dropdown-item-label">{this.props.label}</span>
		}

		const markup =
		(
			<button onClick={this.toggle} style={style.selected_item_label} className="dropdown-item-selected">
				{label}

				{/* an arrow */}
				<div className="dropdown-arrow" style={ this.state.expanded ? style.arrow.expanded : style.arrow }/>
			</button>
		)

		return markup
	}

	// supports disabled javascript
	render_static()
	{
		const markup =
		(
			<div className="rich-fallback">
				<select 
					name={this.props.name} 
					value={this.props.value} 
					onChange={event => {}} 
					style={{ width: 'auto' }}>
					
					{this.list_items().map(item => <option className="dropdown-item" key={item.value} value={item.value}>{item.label}</option>)}
				</select>
			</div>
		)

		return markup
	}

	overflown()
	{
		return this.list_items().length > this.props.max_items
	}

	overflown_height(state = this.state)
	{
		return (state.height - 2 * state.vertical_padding) * (this.props.max_items / this.list_items().length) + state.vertical_padding
	}

	list_items()
	{
		if (show_selected_item_in_list)
		{
			return this.props.options
		}

		return this.props.options.filter(({ value }) => value !== this.props.value)
	}

	should_animate()
	{
		return true

		// return this.list_items().length >= this.props.transition_item_count_min
	}

	toggle(event)
	{
		event.preventDefault()

		// event.stopPropagation() // doesn't work
		event.nativeEvent.stopImmediatePropagation()

		this.setState({ expanded: !this.state.expanded })
	}

	item_clicked(value, event)
	{
		event.preventDefault()

		this.on_change(value)
	}

	document_clicked(event)
	{
		this.setState({ expanded: false })
	}

	calculate_height()
	{
		const list_dom_node = ReactDOM.findDOMNode(this.refs.list)
		const border = parseInt(window.getComputedStyle(list_dom_node).borderTopWidth)
		const height = list_dom_node.scrollHeight // + 2 * border // inner height + 2 * border

		const vertical_padding = parseInt(window.getComputedStyle(list_dom_node.firstChild).paddingTop)

		// const images = list_dom_node.querySelectorAll('img')

		// if (images.length > 0)
		// {
		// 	return this.preload_images(list_dom_node, images)
		// }

		const state = { height, vertical_padding, border }

		if (this.overflown())
		{
			state.list_height = this.overflown_height(state)
		}

		this.setState(state)
	}

	// // https://github.com/daviferreira/react-sanfona/blob/master/src/AccordionItem/index.jsx#L54
	// // Wait for images to load before calculating maxHeight
	// preload_images(node, images)
	// {
	// 	let images_loaded = 0
	//
	// 	const image_loaded = () =>
	// 	{
	// 		images_loaded++
	//
	// 		if (images_loaded === images.length)
	// 		{
	// 			this.setState
	// 			({
	// 				height: this.props.expanded ? node.scrollHeight : 0
	// 			})
	// 		}
	// 	}
	//
	// 	for (let i = 0; i < images.length; i += 1)
	// 	{
	// 		const image = new Image()
	// 		image.src = images[i].src
	// 		image.onload = image.onerror = image_loaded
	// 	}
	// }
}

const arrow_height = 0.35
const arrow_width = 0.4

const style = styler
`
	wrapper
		display        : inline-block
		vertical-align : bottom

	container
		position : relative
		// margin   : 0 auto

		-webkit-user-select : none  /* Chrome all / Safari all */
		-moz-user-select    : none  /* Firefox all */
		-ms-user-select     : none  /* IE 10+ */
		user-select         : none  /* Likely future */

		&expanded

	selected_item_label
		// width      : 100%
		// display: inline-block;
		text-align : left

	arrow
		display  : inline-block

		width        : 0
		height       : 0

		margin-left   : 0.35em
		margin-bottom : 0.1em

		opacity: 0.7

		transition: opacity 100ms ease-out

		border-width : ${arrow_height}em ${arrow_width / 2}em 0 ${arrow_width / 2}em 

		border-style       : solid
		border-left-color  : transparent
		border-right-color : transparent

		&expanded
			opacity: 0.3
  
	list
		position : absolute
		left : 0

		z-index  : 1

		margin          : 0
		padding         : 0
		list-style-type : none

		overflow-x : hidden

		background-color: white

		&downward
			// top  : 100%

			// when html page is overflown by a long list
			// this bottom margin takes effect
			margin-bottom : 1em

		&upward
			bottom: 100%

			// when html page is overflown by a long list
			// this top margin takes effect
			margin-top : 1em

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