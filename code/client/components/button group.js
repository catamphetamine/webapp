import React, { Component, PropTypes } from 'react'
import styler from 'react-styling'

export default class Button_group extends Component
{
	static propTypes =
	{
		options      : PropTypes.arrayOf
		(
			PropTypes.shape
			({
				value: React.PropTypes.string.isRequired,
				label: React.PropTypes.string.isRequired
			})
		)
		.isRequired,
		on_change    : PropTypes.func.isRequired,
		style        : PropTypes.object
	}

	render()
	{
		const { options } = this.props

		const markup = 
		(
			<div className="button-group" style={ this.props.style ? merge(style.container, this.props.style) : style.container }>
				{options.map((option, index) => this.render_button(option, index))}
			</div>
		)

		return markup
	}

	render_button(option, index)
	{
		const { options } = this.props

		const label = option.label

		let button_style = clone(style.button)


		if (index === 0)
		{
			button_style = button_style.first

			button_style.borderRightWidth = 0
		}
		else if (index === options.length - 1)
		{
			button_style = button_style.last
		}
		else
		{
			button_style.borderRightWidth = 0
			
			// button_style = style.button
		}

		const selected = this.props.value === option.value

		if (selected)
		{
			// button_style = merge(button_style, style.button.selected)
			extend(button_style, style.button.selected)
		}

		const markup = 
		(
			<button
				key={option.value}
				type="button"
				onClick={event => this.props.on_change(option.value)}
				className={'button-group-button ' + (selected ? 'button-group-selected' : '')}
				style={button_style}>

				{label}
			</button>
		)

		return markup
	}
}

const border_radius = '0.2em'

const style = styler
`
	container
		position : relative
		display  : inline-block

	button
		padding-left  : 0.8em
		padding-right : 0.8em

		padding-top    : 0.3em
		padding-bottom : 0.3em

		transition: all 50ms ease-out

		// color      : #758A92
		background : #e4eaec

		&first
			border-bottom-left-radius : ${border_radius}
			border-top-left-radius    : ${border_radius}

		&last
			border-bottom-right-radius : ${border_radius}
			border-top-right-radius    : ${border_radius}

		&selected
			color      : #fff
			background : #62a8ea
`