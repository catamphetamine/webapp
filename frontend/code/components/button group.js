import React, { Component, PropTypes } from 'react'
import styler from 'react-styling'
import classNames from 'classnames'

export default class Button_group extends Component
{
	state = {}

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
		disabled     : PropTypes.bool,
		onChange     : PropTypes.func.isRequired,
		style        : PropTypes.object
	}

	constructor(props)
	{
		super(props)

		this.on_key_down = this.on_key_down.bind(this)
	}

	// Client side rendering, javascript is enabled
	componentDidMount()
	{
		this.setState({ javascript: true })
	}

	render()
	{
		const { options } = this.props

		const markup =
		(
			<div
				onKeyDown={this.on_key_down}
				className="rich button-group"
				style={ this.props.style ? { ...style.container, ...this.props.style } : style.container }>

				{options.map((option, index) => this.render_button(option, index))}

				{!this.state.javascript && this.render_static()}
			</div>
		)

		return markup
	}

	render_button(option, index)
	{
		const { value } = this.props

		const selected = value === option.value

		const markup =
		(
			<button
				key={option.value}
				ref={index === 0 ? ref => this.first_button = ref : undefined}
				type="button"
				tabIndex={index === 0 ? undefined : "-1"}
				onClick={this.chooser(option.value)}
				className={classNames('button-group-button',
				{
					'button-group-selected' : selected
				})}
				style={this.option_style(option, index)}>

				{option.label}
			</button>
		)

		return markup
	}

	// supports disabled javascript
	render_static()
	{
		const { options } = this.props

		const markup =
		(
			<div className="rich-fallback">
				{options.map((option, index) => this.render_static_option(option, index))}
			</div>
		)

		return markup
	}

	render_static_option(option, index)
	{
		const { name, value } = this.props

		const markup =
		(
			<span key={option.value} className='button-group-button' style={this.option_style(option, index)}>
				<input
					type="radio"
					name={name}
					checked={value === option.value}/>

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

		// const selected = this.props.value === option.value
		//
		// if (selected)
		// {
		// 	extend(option_style, style.option.selected)
		// }

		return option_style
	}

	chooser(value)
	{
		return event =>
		{
			const { disabled, onChange } = this.props

			if (disabled)
			{
				return
			}

			onChange(value)
		}
	}

	focus()
	{
		ReactDOM.findDOMNode(this.first_button).focus()
	}

	on_key_down(event)
	{
		if (event.ctrlKey || event.altKey || event.shiftKey || event.metaKey)
		{
			return
		}

		const { onChange } = this.props

		switch (event.keyCode)
		{
			// Select the previous option (if present) on left arrow
			case 37:
				event.preventDefault()

				const previous = this.previous_value()

				if (previous !== undefined)
				{
					return onChange(previous)
				}

				return

			// Select the next option (if present) on right arrow
			case 39:
				event.preventDefault()

				const next = this.next_value()

				if (next !== undefined)
				{
					return onChange(next)
				}

				return
		}
	}

	// Get the previous value (relative to the currently selected value)
	previous_value()
	{
		const { options, value } = this.props

		let i = 0
		while (i < options.length)
		{
			if (options[i].value === value)
			{
				if (i - 1 >= 0)
				{
					return options[i - 1].value
				}
			}
			i++
		}
	}

	// Get the next value (relative to the currently selected value)
	next_value()
	{
		const { options, value } = this.props

		let i = 0
		while (i < options.length)
		{
			if (options[i].value === value)
			{
				if (i + 1 < options.length)
				{
					return options[i + 1].value
				}
			}
			i++
		}
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
		// padding-left  : 0.8em
		// padding-right : 0.8em

		// padding-top    : 0.3em
		// padding-bottom : 0.3em

		transition: all 50ms ease-out

		&first
			border-bottom-left-radius : ${border_radius}
			border-top-left-radius    : ${border_radius}

		&last
			border-bottom-right-radius : ${border_radius}
			border-top-right-radius    : ${border_radius}
`