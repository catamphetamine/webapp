import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'
import styler from 'react-styling'

const scrollbar_width = '17px'

export default class Flag extends Component
{
	static propTypes =
	{
		list       : PropTypes.array.isRequired,
		label      : PropTypes.string,
		value      : PropTypes.any,
		select     : PropTypes.func.isRequired,

		max_items  : PropTypes.number,

		transition_item_count_min : PropTypes.number,
		transition_duration_min : PropTypes.number,
		transition_duration_max : PropTypes.number
	}

	static defaultProps = 
	{
		max_items : 6,

		transition_item_count_min : 3,
		transition_duration_min : 70, // milliseconds
		transition_duration_max : 150 // milliseconds
	}

	state = {}

	constructor(props)
	{
		super(props)

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
				this.calculate_height()
			}
		}
	}

	componentWillUnmount()
	{
		document.removeEventListener('click', this.document_clicked)
	}

	render()
	{
		const { list } = this.props

		const item_list = this.list_items()

		const overflow = item_list.length > this.props.max_items

		const list_style = clone(style.list.visible)

		if (this.should_animate())
		{
			let height = this.state.height

			// on overflow the vertical scrollbar will take up space
			// reducing padding-right and the only way to fix that
			// is to add additional padding-right
			if (overflow)
			{
				height = height * (this.props.max_items / item_list.length)
			}

			if (this.state.expanded)
			{
				list_style.maxHeight = height + 'px'
			}
			else
			{
				list_style.maxHeight = 0
			}

			list_style.transitionDuration = this.props.transition_duration_min + ((this.props.transition_duration_max - this.props.transition_duration_min) * Math.min(item_list.length / this.props.max_items, 1)) + 'ms'
		}
		else
		{
			if (this.state.expanded)
			{
				list_style.maxHeight = undefined
			}
			else
			{
				list_style.maxHeight = 0
			}
		}

		if (overflow)
		{
			list_style.overflowY = 'auto'
		}

		const markup = 
		(
			<div style={ this.props.style ? merge(style.wrapper, this.props.style) : style.wrapper } className="dropdown">

				{/* list container */}
				<div style={ this.state.expanded ? style.container.expanded : style.container }>

					{/* currently selected item label */}
					{ this.render_selected_item() }

					{/* a placeholder to make the parent <div/> take the whole width */}
					<ul style={style.list.placeholder} className="dropdown-item-list">
						{ list.map(({ key, label, icon }, index) => this.render_list_item(key, label, icon, overflow))} {/*, index === 0, index === item_list.length - 1*/ }
					</ul>

					{/* a list to select from */}
					{/* Math.max(this.state.height, this.props.max_height) */}
					<ul ref="list" style={list_style} className={'dropdown-item-list' + ' ' + (this.state.expanded ? 'dropdown-item-list-expanded' : '')}>
						{ item_list.map(({ key, label, icon }, index) => this.render_list_item(key, label, icon, overflow))}
					</ul>
				</div>
			</div>
		)

		return markup
	}

	render_list_item(key, label, icon, overflow) // , first, last
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

		const list_item_style = (key === this.props.value) ? { maxHeight: 0, overflow: 'hidden', textAlign: 'left' } : { textAlign: 'left' } 

		// a hack to restore padding-right taken up by a vertical scrollbar
		if (overflow)
		{
			list_item_style.paddingRight = scrollbar_width
		}

		const markup =
		(
			<li key={key} style={list_item_style}>
				<button onClick={event => this.item_clicked(key, event)} style={item_style} className="dropdown-item">
					<span className="dropdown-item-icon">{icon}</span>
					<span className="dropdown-item-label">{label}</span>
				</button>
			</li>
		)

		return markup
	}

	render_selected_item()
	{
		const selected = this.props.list.filter(x => x.key === this.props.value)[0]

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

	list_items()
	{
		return this.props.list.filter(({ key }) => key !== this.props.value)
	}

	should_animate()
	{
		return this.list_items().length >= this.props.transition_item_count_min
	}

	toggle(event)
	{
		event.preventDefault()

		// event.stopPropagation() // doesn't work
		event.nativeEvent.stopImmediatePropagation()

		this.setState({ expanded: !this.state.expanded })
	}

	item_clicked(key, event)
	{
		event.preventDefault()

		if (key === this.props.value)
		{
			return
		}

		this.props.select(key)
	}

	document_clicked(event)
	{
		this.setState({ expanded: false })
	}

	calculate_height()
	{
		const list_dom_node = ReactDOM.findDOMNode(this.refs.list)
		let height = list_dom_node.scrollHeight + list_dom_node.offsetHeight // inner height + 2 * border

		// const images = list_dom_node.querySelectorAll('img')

		// if (images.length > 0)
		// {
		// 	return this.preload_images(list_dom_node, images)
		// }

		this.setState({ height: height })
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

const style = styler
`
	wrapper
		display        : inline-block
		vertical-align : bottom

	container
		position : relative
		// margin   : 0 auto

		&expanded

	selected_item_label
		width      : 100%
		text-align : left

	arrow
		display  : inline-block

		width        : 0
		height       : 0

		margin-left   : 0.3em
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

		// // Hiding
		// opacity        : 0
		// pointer-events : none

		max-height : 0
		overflow-y : hidden

		&visible
			overflow-x : hidden

			// when html page is overflown by a long list
			// this bottom margin takes effect
			margin-bottom : 1em

			background-color: white

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