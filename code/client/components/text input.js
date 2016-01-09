import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'
import styler from 'react-styling'

export default class Text_input extends Component
{
	static propTypes =
	{
		name        : PropTypes.string,
		value       : PropTypes.any,
		on_change   : PropTypes.func.isRequired,
		placeholder : PropTypes.string,
		multiline   : PropTypes.bool,
		email       : PropTypes.bool,
		password    : PropTypes.bool,
		style       : PropTypes.object
	}

	render()
	{
		const { name, value, on_change, placeholder, multiline, email, password, style } = this.props

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

		if (multiline)
		{
			// maybe add autoresize for textarea (smoothly animated)
			return <textarea ref="textarea" name={name} style={style} value={value} onChange={event => on_change(event.target.value)} placeholder={placeholder}/>
		}
		else
		{
			return <input type={type} name={name} style={style} value={value} onChange={event => on_change(event.target.value)} placeholder={placeholder}/>
		}

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
		const textarea = ReactDOM.findDOMNode(this.refs.textarea)

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
`