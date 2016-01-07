import React, { Component, PropTypes } from 'react'
// import styler from 'react-styling'

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
		style       : PropTypes.object
	}

	render()
	{
		const { name, value, on_change, placeholder, multiline, email, style } = this.props

		if (multiline)
		{
			// maybe add autoresize for textarea (smoothly animated)
			return <textarea ref="textarea" name={name} style={style} value={value} onChange={event => on_change(event.target.value)} placeholder={placeholder}/>
		}
		else
		{
			return <input type={email ? 'email' : 'text'} name={name} style={style} value={value} onChange={event => on_change(event.target.value)} placeholder={placeholder}/>
		}

		return markup
	}
}

// const style = styler
// `
// `