import React, { Component, PropTypes } from 'react'
// import styler from 'react-styling'

export default class Text_input extends Component
{
	static propTypes =
	{
		value       : PropTypes.any,
		on_change   : PropTypes.func.isRequired,
		placeholder : PropTypes.string,
		style       : PropTypes.object
	}

	render()
	{
		const { value, on_change, placeholder, style } = this.props

		const markup = 
		(
			<input type="text" style={style} value={value} onChange={event => on_change(event.target.value)} placeholder={placeholder}/>
		)

		return markup
	}
}

// const style = styler
// `
// `