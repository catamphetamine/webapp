import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'
import styler from 'react-styling'
import classNames from 'classnames'

import input from './input'

@input()
export default class Text_input extends Component
{
	state = {}

	static propTypes =
	{
		label            : PropTypes.string,
		name             : PropTypes.string,
		value            : PropTypes.any,
		disabled         : PropTypes.bool,
		description      : PropTypes.string,
		on_change        : PropTypes.func.isRequired,
		invalid          : PropTypes.string,
		indicate_invalid : PropTypes.bool,
		placeholder      : PropTypes.string,
		multiline        : PropTypes.bool,
		email            : PropTypes.bool,
		password         : PropTypes.bool,
		focus            : PropTypes.bool,
		style            : PropTypes.object,
		input_style      : PropTypes.object,
		label_style      : PropTypes.object
	}

	constructor(props, context)
	{
		super(props, context)

		this.autoresize = this.autoresize.bind(this)
	}

	// Client side rendering, javascript is enabled
	componentDidMount()
	{
		if (this.props.multiline)
		{
			this.setState({ autoresize: autoresize_measure(ReactDOM.findDOMNode(this.refs.input)) })
		}

		this.setState({ javascript: true })
	}

	render()
	{
		const { name, value, label, label_style, description, invalid, indicate_invalid, className } = this.props

		const markup =
		(
			<div
				style={this.props.style ? { ...style.text_input, ...this.props.style } : style.text_input}
				className={classNames
				(
					'rich',
					'text-input',
					{
						'text-input--empty'   : !value,
						'text-input--invalid' : indicate_invalid && invalid
					},
					className
				)}>

				{/* Description */}
				{this.render_description()}

				{/* <input/> */}
				{this.render_input({ name: false })}

				{/* input label */}
				{/* htmlFor={name} */}
				{!description && label &&
					<label
						className="text-input-label"
						style={label_style ? { ...style.label, ...label_style } : style.label}>
						{label}
					</label>
				}

				{/* Error message */}
				{this.render_error_message()}

				{/* Fallback in case javascript is disabled (no animated <label/>) */}
				{!this.state.javascript && this.render_static()}
			</div>
		)

		return markup
	}

	render_description()
	{
		const { description, value } = this.props

		if (!description)
		{
			return
		}

		const markup =
		(
			<p
				className="text-input__description"
				style={value && !value.is_blank() ? style.description.tame : style.description}>
				{description}
			</p>
		)

		return markup
	}

	render_input(options = {})
	{
		const { placeholder, ref, name } = options
		const { value, multiline, email, password, focus, on_change, disabled } = this.props

		let type

		if (email)
		{
			type = 'email'
		}
		else if (password)
		{
			type = 'password'
		}
		else
		{
			type = 'text'
		}

		let input_style = style.input
		if (this.props.input_style)
		{
			input_style = { ...input_style, ...this.props.input_style }
		}

		const properties =
		{
			name        : name === false ? undefined : this.props.name,
			ref         : ref === false ? undefined : 'input',
			value       : (value === undefined || value === null) ? '' : value,
			placeholder : placeholder || this.props.placeholder,
			onChange    : on_change,
			disabled,
			// onFocus     : this.props.on_focus,
			// onBlur      : this.props.on_blur,
			className   : 'text-input-field',
			style       : input_style,
			autoFocus   : focus
		}

		if (multiline)
		{
			// maybe add autoresize for textarea (smoothly animated)
			return <textarea
				rows={2}
				onInput={this.autoresize}
				onKeyUp={this.autoresize}
				{...properties}/>
		}

		return <input type={type} {...properties}/>
	}

	render_error_message()
	{
		const { invalid, indicate_invalid } = this.props

		if (indicate_invalid && invalid)
		{
			return <div className="text-input-error-message">{invalid}</div>
		}
	}

	// Fallback in case javascript is disabled (no animated <label/>)
	render_static()
	{
		const markup =
		(
			<div className="rich-fallback">
				{/* Description */}
				{this.render_description()}

				{/* <input/> */}
				{this.render_input({ placeholder: this.props.label, ref: false })}

				{/* Error message */}
				{this.render_error_message()}
			</div>
		)

		return markup
	}

	// "keyup" is required for IE to properly reset height when deleting text
	autoresize(event)
	{
		const element = event.target

		const current_scroll_position = window.pageYOffset

		element.style.height = 0

		let height = element.scrollHeight + this.state.autoresize.extra_height
		height = Math.max(height, this.state.autoresize.initial_height)

		element.style.height = height + 'px'

		window.scroll(window.pageXOffset, current_scroll_position)
	}

	/*
	// if this is ever implemented then also add these styles:
	//
	// textarea
	// {
	// 	overflow-y: hidden;
	// 	resize: none;
	// }
	//
	// https://github.com/Dogfalo/materialize/blob/master/js/forms.js#L118
	autoresize()
	{
		const textarea = ReactDOM.findDOMNode(this.refs.input)

		// Set font properties of hidden_div

		const font_family = textarea.style.fontFamily
		const font_size = textarea.style.fontSize

		if (font_size)
		{
			hidden_div.style.fontSize = font_size
		}

		if (font_family)
		{
			hidden_div.style.fontFamily = font_family
		}

		// if (textarea.getAttribute('wrap') === "off")
		// {
		// 	hidden_div.css('overflow-wrap', "normal")
		// 		.css('white-space', "pre")
		// }

		hidden_div.text(textarea.val() + '\n')
		const content = hidden_div.innerHTML.replace(/\n/g, '<br>')
		hidden_div.innerHTML = content

		// When textarea is hidden, width goes crazy.
		// Approximate with half of window size

		if (textarea.is(':visible'))
		{
			hidden_div.style.width = textarea.width()
		}
		else
		{
			hidden_div.style.width = $(window).width() / 2
		}

		textarea.style.height = hidden_div.height()
	}
	*/
}

const style = styler
`
	text_input

	input
		max-width : 100%

	label
		-webkit-user-select : none
		-moz-user-select    : none
		-ms-user-select     : none
		user-select         : none

	description
		transition : opacity 160ms ease-out

		&tame
			opacity : 0.6
`

// <textarea/> autoresize (without ghost elements)
// https://github.com/javierjulio/textarea-autosize/blob/master/src/jquery.textarea_autosize.js
function autoresize_measure(element)
{
	const style = window.getComputedStyle(element)

	const extra_height = 
		parseInt(style.borderTopWidth) +
		parseInt(style.borderBottomWidth)

	// Raw `.getBoundingClientRect().height` could be used here
	// to avoid rounding (e.g. `em`, `rem`, `pt`, etc),
	// but setting `.scrollHeight` has no non-rounded equivalent.
	const initial_height = Math.ceil(element.getBoundingClientRect().height) // element.offsetHeight
	// Apply height rounding
	element.style.height = initial_height + 'px'

	return { extra_height, initial_height }
}
