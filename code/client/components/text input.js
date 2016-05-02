import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'
import styler from 'react-styling'

import { inject } from './common'

export default class Text_input extends Component
{
	state = {}

	static propTypes =
	{
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

	render()
	{
		const markup = 
		(
			<div
				className={'text-input ' + (this.state.valid === false ? 'text-input-invalid' : '')}
				style={this.props.style}>

				{this.render_input()}

				{ this.state.valid === false ? <div className="text-input-error-message">{this.state.error_message}</div> : null }
			</div>
		)

		return markup
	}

	render_input()
	{
		const { name, value, placeholder, multiline, email, password, focus } = this.props

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
				className="text-input-field"
				style={input_style}
				value={value === undefined ? '' : value}
				onFocus={this.on_focus}
				onChange={this.on_change}
				placeholder={placeholder}
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
				placeholder={placeholder}
				autoFocus={focus}/>
		}
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
`