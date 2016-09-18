import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'

const hide_timeout = 120 // in milliseconds

// https://github.com/Dogfalo/materialize/blob/master/js/tooltip.js
export default class Tooltip extends Component
{
	static propTypes =
	{
		text: PropTypes.string.isRequired,
		container: PropTypes.func
	}

	constructor(props, context)
	{
		super(props, context)

		this.show = this.show.bind(this)
		this.hide = this.hide.bind(this)

		this.on_mouse_enter = this.on_mouse_enter.bind(this)
		this.on_mouse_leave = this.on_mouse_leave.bind(this)
		this.on_touch_start = this.on_touch_start.bind(this)

		this.mobile = false
	}

	componentWillMount()
	{
		// Don't render tooltip on server side
		if (typeof document === 'undefined')
		{
			return
		}

		this.tooltip = document.createElement('div')

		this.tooltip.style.display = 'none'
		this.tooltip.style.position = 'absolute'
		this.tooltip.style.left = 0
		this.tooltip.style.top = 0

		this.tooltip.classList.add('tooltip')

		this.tooltip.textContent = this.props.text

		this.container().appendChild(this.tooltip)
	}

	componentWillUnmount()
	{
		this.container().removeChild(this.tooltip)
	}

	container()
	{
		return (this.props.container && this.props.container()) || document.body
	}

	show()
	{
		if (this.tooltip.style.display === 'block')
		{
			return
		}

		this.tooltip.style.display = 'block'

		const width  = this.tooltip.offsetWidth
		const height = this.tooltip.offsetHeight

		const origin = ReactDOM.findDOMNode(this.refs.origin)

		const origin_width  = origin.offsetWidth
		// const origin_height = origin.offsetHeight

		const _offset = offset(origin)

		const top  = _offset.top - height - offset(this.container()).top
		const left = _offset.left + origin_width / 2 - width / 2

		const coordinates = reposition_within_screen(left, top, width, height)

		// console.log(coordinates)

		this.tooltip.style.left = coordinates.x + 'px'
		this.tooltip.style.top  = coordinates.y + 'px'

		if (this.hide_timeout)
		{
			clearTimeout(this.hide_timeout)
			this.hide_timeout = undefined

			this.tooltip.classList.remove('tooltip--before-hide')
		}

		this.tooltip.classList.add('tooltip--after-show')
	}

	hide()
	{
		// If already hiding, or if already hidden, then do nothing.
		if (this.hide_timeout || this.tooltip.style.display === 'none')
		{
			return
		}

		this.tooltip.classList.add('tooltip--before-hide')

		this.hide_timeout = setTimeout(() =>
		{
			this.tooltip.style.display = 'none'
		},
		hide_timeout)
	}

	on_mouse_enter()
	{
		// mouse enter and mouse leave events
		// are triggered on mobile devices too
		if (this.mobile)
		{
			return
		}

		this.show()
	}

	on_mouse_leave()
	{
		// mouse enter and mouse leave events
		// are triggered on mobile devices too
		if (this.mobile)
		{
			return
		}

		this.hide()
	}

	on_touch_start()
	{
		// mouse enter events won't be processed from now on
		this.mobile = true

		this.show()
	}

	render()
	{
		// Shows tooltip on mouse over when on desktop.
		// Shows tooltip on touch when on mobile.

		const markup =
		(
			<div
				ref="origin"
				onMouseEnter={this.on_mouse_enter}
				onMouseLeave={this.on_mouse_leave}
				onTouchStart={this.on_touch_start}
				onTouchMove={this.hide}
				onTouchEnd={this.hide}
				onTouchCancel={this.hide}
				style={{ display: 'inline-block' }}>
				{this.props.children}
			</div>
		)

		return markup
	}
}

function reposition_within_screen(x, y, width, height)
{
	const minimal_margin = 4 // in pixels

	if (x < minimal_margin)
	{
		x = minimal_margin
	}
	else if (x + width + minimal_margin > window.innerWidth)
	{
		x -= (x + width + minimal_margin) - window.innerWidth
	}

	if (y < window.pageYOffset + minimal_margin)
	{
		y = window.pageYOffset + minimal_margin
	}
	else if (y + height + minimal_margin > window.pageYOffset + window.innerHeight)
	{
		y -= (y + height + minimal_margin) - (window.pageYOffset + window.innerHeight)
	}

	return { x, y }
}

// http://stackoverflow.com/questions/5598743/finding-elements-position-relative-to-the-document
function offset(element)
{
	const rect = element.getBoundingClientRect()

	const client_left = document.clientLeft || document.body.clientLeft || 0
	const client_top  = document.clientTop || document.body.clientTop || 0

	const top  = rect.top + window.pageYOffset - client_top
	const left = rect.left + window.pageXOffset - client_left

	return { top, left }
}