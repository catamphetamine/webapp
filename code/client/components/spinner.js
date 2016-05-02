import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'
import styler from 'react-styling'

// http://codepen.io/jczimm/pen/vEBpoL
// (18.02.2016)

// https://github.com/callemall/material-ui/blob/master/src/circular-progress.jsx
// 16.01.2016

// const more_than_circumference_max_length = 200

// const stripe_contracted_length = 1
// const stripe_expanded_length   = 89

export default class Spinner extends Component
{
	static propTypes =
	{
		/**
		* The max value of progress, only works in determinate mode.
		*/
		// max: PropTypes.number,

		/**
		* The min value of progress, only works in determinate mode.
		*/
		// min: PropTypes.number,

		/**
		* The mode of show your progress, indeterminate
		* for when there is no value for progress.
		*/
		// mode: PropTypes.oneOf(['determinate', 'indeterminate']),

		/**
		* Override the inline-styles of the root element.
		*/
		style: PropTypes.object,

		/**
		* The value of progress, only works in determinate mode.
		*/
		// value: PropTypes.number
	}

	static defaultProps = 
	{
		// mode  : 'indeterminate',
		// value : 0,
		// min   : 0,
		// max   : 100
	}

	// componentDidMount()
	// {
	// 	const wrapper = ReactDOM.findDOMNode(this.refs.wrapper)
	// 	const path    = ReactDOM.findDOMNode(this.refs.path)
	//
	// 	this.evolve(path)
	// 	this.rotate_wrapper(wrapper)
	// }

	// componentWillUnmount()
	// {
	// 	clearTimeout(this.path_evolution_timer)
	// 	clearTimeout(this.rotate_wrapper_timer)
	// }

	render()
	{
		// <div ref="wrapper"
		// <circle ref="path"

		let path_style = style.path

		// if (this.props.mode === 'determinate')
		// {
		// 	path_style = merge(path_style,
		// 	{
		// 		transition      : 'all 0.3s linear',
		// 		strokeDasharray : `${Math.round(this.current_progress() * 1.25)},${more_than_circumference_max_length}`
		// 	})
		// }

		// <div style={style.wrapper}>
		// 	<svg/>
		// </div>

		const markup = 
		(
			<div className="spinner" style={this.props.style}>
				<svg viewBox="0 0 50 50">
					<circle 
						style={path_style} 
						cx="25" 
						cy="25" 
						r="20" 
						fill="none" 
						strokeWidth="2.5" 
						strokeMiterlimit="10"/>
				</svg>
			</div>
		)

		return markup
	}

	// current_progress()
	// {
	// 	const { value, min, max } = this.props

	// 	const clamped_value = Math.min(Math.max(min, value), max)
	// 	const relative_value = Math.round(clamped_value / (max - min) * 10000) / 10000

	// 	return relative_value * 100
	// }

	// // the path is scaled in three steps:
	// // step 0 is 250 ms long (contracted)
	// // step 1 is 750 ms long (expanded)
	// // step 2 is 750 ms long (contracted)
	// evolve(path, step)
	// {
	// 	if (this.props.mode !== 'indeterminate')
	// 	{
	// 		return
	// 	}

	// 	// step can be one of: 0, 1, 2
	// 	step = step || 0
	// 	step %= 3

	// 	// initial contracted state
	// 	if (step === 0) 
	// 	{
	// 		path.style.strokeDasharray    = `${stripe_contracted_length}, ${more_than_circumference_max_length}`
	// 		path.style.strokeDashoffset   = 0
	// 		path.style.transitionDuration = '0ms'
	// 	} 
	// 	// expanded state (left side expands)
	// 	else if (step === 1)
	// 	{
	// 		path.style.strokeDasharray    = `${stripe_expanded_length}, ${more_than_circumference_max_length}`
	// 		path.style.strokeDashoffset   = -35
	// 		path.style.transitionDuration = '750ms'
	// 	} 
	// 	// final contracted state (right side contracts)
	// 	else
	// 	{
	// 		path.style.strokeDasharray    = `${stripe_expanded_length}, ${more_than_circumference_max_length}`
	// 		path.style.strokeDashoffset   = -124
	// 		path.style.transitionDuration = '850ms'
	// 	}

	// 	// transition to the next step on timeout
	// 	this.path_evolution_timer = setTimeout(() => this.evolve(path, step + 1), step ? 750 : 250)
	// }

	// rotate_wrapper(wrapper)
	// {
	// 	if (this.props.mode !== 'indeterminate')
	// 	{
	// 		return
	// 	}

	// 	wrapper.style.transform          = 'rotate(0deg)'
	// 	wrapper.style.transitionDuration = '0ms'

	// 	setTimeout(() =>
	// 	{
	// 		wrapper.style.transform                = 'rotate(1800deg)'
	// 		wrapper.style.transitionDuration       = '10s'
	// 		wrapper.style.transitionTimingFunction = 'linear'
	// 	},
	// 	50)

	// 	this.rotate_wrapper_timer = setTimeout(() => this.rotate_wrapper(wrapper), 10050)
	// }
}

const style = styler
`
	container
		display : inline-block

	wrapper
		width  : 100%
		height : 100%

		// transition : transform 20s linear

	path
		stroke-dashoffset : 0
		stroke-linecap    : round
		transition        : all 1.5s ease-in-out
`

	// path
		// &dynamic
		// 	stroke-dasharray  : ${stripe_contracted_length},${more_than_circumference_max_length}

		// &static
		// 	stroke-dasharray  : ${stripe_expanded_length},${more_than_circumference_max_length}