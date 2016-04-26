import React, { Component, PropTypes } from 'react'
import styler from 'react-styling'

import Spinner from './spinner'

export default class Button extends Component
{
	static propTypes =
	{
		action          : PropTypes.func,
		busy            : PropTypes.bool,
		submit          : PropTypes.bool,
		link            : PropTypes.string,
		className       : PropTypes.string,
		buttonClassName : PropTypes.string,
		style           : PropTypes.object,
		button_style    : PropTypes.object
	}

	render()
	{
		const { busy, submit, className } = this.props

		const markup = 
		(
			<div className={'button' + ' ' + (submit ? 'button-primary' : '') + ' ' + (busy ? 'button-busy' : '') + ' ' + (className ? className : '')} style={merge(style.container, this.props.style)}>
				<Spinner style={ busy ? style.spinner.show : style.spinner.hide }></Spinner>

				{this.render_button()}
			</div>
		)

		return markup
	}

	render_button()
	{
		const { link, busy, action, submit, className, buttonClassName } = this.props

		let button_style = busy ? style.button.hide : style.button.show 

		if (this.props.button_style)
		{
			button_style = merge(button_style, this.props.button_style)
		}

		if (link)
		{
			const markup = 
			(
				<a
					href={link}
					onClick={event =>
					{
						// ignore mouse wheel clicks
						// and clicks with a modifier key pressed
						if (event.nativeEvent.which === 2
							|| event.shiftKey 
							|| event.altKey 
							|| event.ctrlKey 
							|| event.metaKey)
						{
							return
						}

						event.preventDefault()

						if (busy)
						{
							return
						}

						action()
					}}
					className={'button' + (buttonClassName ? ' ' + buttonClassName : '')}
					style={button_style}>

					{this.props.children}
				</a>
			)

			return markup
		}

		const markup = 
		(
			<button
				type={submit ? 'submit' : 'button'}
				disabled={busy}
				onClick={action}
				className={buttonClassName}
				style={button_style}>

				{this.props.children}
			</button>
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
		// (if z-index = -1 then it disappears)
		z-index    : 0
		top        : 0.1em

		width  : 1em
		height : 1em

		pointer-events : none

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