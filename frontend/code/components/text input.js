import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'
import styler from 'react-styling'
import classNames from 'classnames'

import { inject } from './common'

export default class Text_input extends Component
{
	state = {}

	static propTypes =
	{
		label       : PropTypes.string,
		name        : PropTypes.string,
		value       : PropTypes.any,
		on_change   : PropTypes.func.isRequired,
		validate    : PropTypes.func,
		placeholder : PropTypes.string,
		multiline   : PropTypes.bool,
		email       : PropTypes.bool,
		password    : PropTypes.bool,
		focus       : PropTypes.bool,
		style       : PropTypes.object
	}

	constructor(props, context)
	{
		super(props, context)

		inject(this)

		this.on_focus  = this.on_focus.bind(this)
		this.on_change = this.on_change.bind(this)
	}

	// Client side rendering, javascript is enabled
	componentDidMount()
	{
		this.setState({ javascript: true })
	}

	render()
	{
		const { name, value, label, className } = this.props
		const { valid } = this.state

		const markup = 
		(
			<div
				style={this.props.style}
				className={classNames
				(
					'rich',
					'text-input',
					{
						'text-input-empty'   : !value,
						'text-input-invalid' : valid === false
					},
					className
				)}>

				{/* <input/> */}
				{this.render_input({ placeholder: false })}

				{/* input label */}
				{label && <label htmlFor={name} className="text-input-label" style={style.label}>{label}</label>}

				{/* Error message */}
				{this.render_error_message()}

				{/* Fallback in case javascript is disabled (no animated <label/>) */}
				{!this.state.javascript && this.render_static()}
			</div>
		)

		return markup
	}

	render_input({ placeholder })
	{
		const { name, value, label, multiline, email, password, focus } = this.props

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

		// let input_style = style.input
		// if (this.props.input_style)
		// {
		// 	input_style = merge(input_style, this.props.input_style)
		// }

		const input_style = this.props.input_style

		if (multiline)
		{
			// maybe add autoresize for textarea (smoothly animated)
			return <textarea
				ref="input"
				name={name}
				rows={2}
				className="text-input-field"
				style={input_style}
				value={value === undefined ? '' : value}
				onFocus={this.on_focus}
				onChange={this.on_change}
				placeholder={placeholder ? label : undefined}
				autoFocus={focus}/>
		}
		else
		{
			return <input
				ref="input"
				type={type}
				name={name}
				className="text-input-field"
				style={input_style}
				value={value === undefined ? '' : value}
				onFocus={this.on_focus}
				onChange={this.on_change}
				placeholder={placeholder ? label : undefined}
				autoFocus={focus}/>
		}
	}

	render_error_message()
	{
		const { valid, error_message } = this.state

		if (valid === false)
		{
			return <div className="text-input-error-message">{error_message}</div>
		}
	}

	// Fallback in case javascript is disabled (no animated <label/>)
	render_static()
	{
		const markup =
		(
			<div className="rich-fallback">
				{/* <input/> */}
				{this.render_input({ placeholder: true })}

				{/* Error message */}
				{this.render_error_message()}
			</div>
		)

		return markup
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
	input
		width : 100%

	label
		-webkit-user-select : none
		-moz-user-select    : none
		-ms-user-select     : none
		user-select         : none
`