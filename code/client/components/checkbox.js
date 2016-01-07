import React, { Component, PropTypes } from 'react'
import styler from 'react-styling'
import ReactDOM from 'react-dom'

// http://tympanus.net/codrops/2013/10/15/animated-checkboxes-and-radio-buttons-with-svg/

export default class Checkbox extends Component
{
	state = {}
	
	static propTypes =
	{
		value     : PropTypes.bool,
		label     : PropTypes.string.isRequired,
		on_change : PropTypes.func.isRequired,
		style     : PropTypes.object
	}

	componentDidMount()
	{
		if (this.props.value)
		{
			this.draw_checkmark()
		}
	}

	componentDidUpdate(previous_props, previous_state)
	{
		if (this.props.value !== previous_props.value)
		{
			if (this.props.value)
			{
				this.draw_checkmark()
			}
		}
	}

	draw_checkmark()
	{
		// for (var i = 0, i < paths.length; i++) {

		const i = 0

		const path_element = ReactDOM.findDOMNode(this.refs.path)

		const animation = { speed : .1, easing : 'ease-in-out' }

		const path_style = {}

		const length = path_element.getTotalLength() // in pixels
		path_style.strokeDasharray = `${length} ${length}`

		// if (i === 0)
		// {
			path_element.style.strokeDashoffset = Math.floor(length) - 1
		// }
		// else 
		// {
		// 	path_element.style.strokeDashoffset = length
		// }

		// Trigger a layout so styles are calculated & the browser
		// picks up the starting position before animating
		path_element.getBoundingClientRect()

		// Define our transition
		// (skips the animation on the initial page render)
		if (this.was_toggled)
		{
			path_style.transition = 
			path_element.style.WebkitTransition = 
			path_element.style.MozTransition = 
				`stroke-dashoffset ${animation.speed}s ${animation.easing} ${i * animation.speed}s`
		}

		// Go
		path_style.strokeDashoffset = 0

		this.setState({ path_style: extend(path_style, style.svg_path) })
	}

	render()
	{
		const { value, on_change, label } = this.props

		const markup = 
		(
			<div className="checkbox" style={ this.props.style ? merge(style.container, this.props.style) : style.container}>
				<input ref="checkbox" type="checkbox" onChange={::this.toggle} style={style.checkbox.input} value={value}/>
				<div className="checkbox_border" style={ !value ? style.checkbox.label_before : style.checkbox.label_before.when_checked }></div>
				<label className="checkbox_label" style={style.label} onClick={::this.toggle}>{label}</label>
				<svg viewBox="0 0 100 100" style={style.checkbox.svg}>
					{ value ? this.render_checkmark() : null }
				</svg>
			</div>
		)

		return markup
	}

	render_checkmark()
	{
		const path = ['M16.667,62.167c3.109,5.55,7.217,10.591,10.926,15.75 c2.614,3.636,5.149,7.519,8.161,10.853c-0.046-0.051,1.959,2.414,2.692,2.343c0.895-0.088,6.958-8.511,6.014-7.3 c5.997-7.695,11.68-15.463,16.931-23.696c6.393-10.025,12.235-20.373,18.104-30.707C82.004,24.988,84.802,20.601,87,16']

		if (_client_)
		{
			const path_style =
			{
				fill: 'transparent',
				strokeLinecap: 'round',
				strokeLinejoin: 'round',
				// strokeDashoffset: 0,
				// strokeDasharray: 'none'
			}

			return <path ref="path" d={path} style={this.state.path_style || path_style}></path>
		}

		if (_server_)
		{
			const path_style =
			{
				fill: 'transparent',
				strokeLinecap: 'round',
				strokeLinejoin: 'round',
				// strokeDashoffset: 0,
				// strokeDasharray: 'none'
			}

			return <path d={path} style={path_style}></path>
		}
	}

	toggle()
	{
		// (allows checkmark animation from now on)
		this.was_toggled = true

		if (this.props.value)
		{
			this.setState({ path_style: undefined })
		}

		this.props.on_change(!this.props.value)
	}
}

const style = styler
`
	container
		display: inline-block
		position: relative

	label
		display: inline-block
		position: relative
		padding-left: 1.5em
		vertical-align: bottom
		color: inherit
		cursor: default

		-webkit-user-select : none
		-moz-user-select    : none
		-ms-user-select     : none
		user-select         : none

	checkbox
		position: absolute
		left: 0
		bottom: 0.15em

		width: 0.9em;
		height: 0.9em;

		position: absolute;
		// cursor: pointer;

		&input
			opacity: 0
			display: inline-block
			vertical-align: bottom
			z-index: 100

			margin: 0;

		&label_before
			border: 0.1em solid #cfcfcf
			transition: opacity 0.3s

			&when_checked
				border: 0.1em solid #e7e7e7

		&svg
			width: 0.8em
			height: 0.8em

			margin-left: 0.1em
			margin-bottom: 0.15em

			pointer-events: none

	svg_path
		stroke: #000000;
		stroke-width: 0.4em;
		stroke-linecap: round;
		stroke-linejoin: round;
		fill: none;
`