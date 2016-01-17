import React, { Component, PropTypes } from 'react'
import styler from 'react-styling'

import Spinner from './spinner'

export default class Button extends Component
{
	static propTypes =
	{
		action       : PropTypes.func,
		busy         : PropTypes.bool,
		submit       : PropTypes.bool,
		className    : PropTypes.string,
		style        : PropTypes.object,
		button_style : PropTypes.object
	}

	render()
	{
		const { busy, action, submit, className } = this.props

		let button_style = busy ? style.button.hide : style.button.show 

		if (this.props.button_style)
		{
			button_style = merge(button_style, this.props.button_style)
		}

		const markup = 
		(
			<div className={'button ' + (submit ? 'button-primary' : '') + (className ? className : '')} style={merge(style.container, this.props.style)}>
				<Spinner style={ busy ? style.spinner.show : style.spinner.hide }></Spinner>

				<button
					type={submit ? 'submit' : 'button'}
					disabled={busy}
					onClick={action}
					style={button_style}>

					{this.props.children}
				</button>
			</div>
		)

		return markup
	}
}

const style = styler
`
	container
		position : relative
		display  : inline-block

	spinner
		position   : absolute
		z-index    : -1
		top        : 0.1em

		width  : 1em
		height : 1em

		transition : opacity 300ms ease-out

		&show
			opacity          : 1
			transition-delay : 350ms
		&hide
			transition : opacity 200ms ease-out
			opacity    : 0

	button
		&show
			opacity          : 1
			transition       : opacity 150ms ease-out
			transition-delay : 100ms
		&hide
			opacity          : 0
			transition       : opacity 200ms ease-out
			transition-delay : 300ms
`