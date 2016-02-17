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
		name         : PropTypes.string,
		value        : PropTypes.any,
		on_change    : PropTypes.func.isRequired,
		style        : PropTypes.object
	};

	render()
	{
		const { options } = this.props

		const markup = 
		(
			<div className="rich button-group" style={ this.props.style ? merge(style.container, this.props.style) : style.container }>
				{options.map((option, index) => this.render_button(option, index))}

				{this.render_static()}
			</div>
		)

		return markup
	}

	render_button(option, index)
	{
		const selected = this.props.value === option.value

		const markup = 
		(
			<button
				key={option.value}
				type="button"
				onClick={event => this.props.on_change(option.value)}
				className={'button-group-button' + ' ' + (selected ? 'button-group-selected' : '')}
				style={this.option_style(option, index)}>

				{option.label}
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
				{this.props.options.map((option, index) => this.render_static_option(option, index))}
			</div>
		)

		return markup
	}

	render_static_option(option, index)
	{
		const selected = this.props.value === option.value

		const markup =
		(
			<span key={option.value} className='button-group-button' style={this.option_style(option, index)}>
				<input
					type="radio"
					name={this.props.name}
					checked={selected}
					style={{}}/>

				{option.label}
			</span>
		)

		return markup
	}

	option_style(option, index)
	{
		let option_style = clone(style.option)

		if (index === 0)
		{
			option_style = option_style.first

			option_style.borderRightWidth = 0
		}
		else if (index === this.props.options.length - 1)
		{
			option_style = option_style.last
		}
		else
		{
			option_style.borderRightWidth = 0
		}

		const selected = this.props.value === option.value

		if (selected)
		{
			extend(option_style, style.option.selected)
		}

		return option_style
	}
}

const border_radius = '0.2em'

const style = styler
`
	container
		position    : relative
		display     : inline-block
		white-space : nowrap

	option
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