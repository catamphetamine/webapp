import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'
import styler from 'react-styling'
import classNames from 'classnames'

import Spinner from './spinner'

export default class Button extends Component
{
	static propTypes =
	{
		action          : PropTypes.func,
		busy            : PropTypes.bool,
		disabled        : PropTypes.bool,
		primary         : PropTypes.bool,
		submit          : PropTypes.bool,
		link            : PropTypes.string,
		className       : PropTypes.string,
		style           : PropTypes.object,
		button_style    : PropTypes.object
	}

	render()
	{
		const { busy, primary, submit, className } = this.props

		const markup = 
		(
			<div
				className={classNames('button', className,
				{
					'button--primary' : primary || submit,
					'button--busy'    : busy
				})}
				style={merge(style.container, this.props.style)}>

				<Spinner style={ busy ? style.spinner.show : style.spinner.hide }></Spinner>

				{this.render_button()}
			</div>
		)

		return markup
	}

	render_button()
	{
		const { link, busy, primary, disabled, action, submit, className } = this.props

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
					ref="button"
					href={link}
					onClick={event =>
					{
						// Ignore mouse wheel clicks
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

						if (busy || disabled)
						{
							return
						}

						action(event)
					}}
					className={classNames('button__link')}
					style={button_style}>

					{this.props.children}
				</a>
			)

			return markup
		}

		const markup = 
		(
			<button
				ref="button"
				type={submit ? 'submit' : 'button'}
				disabled={busy || disabled}
				onClick={action}
				style={button_style}>

				{this.props.children}
			</button>
		)

		return markup
	}

	focus()
	{
		ReactDOM.findDOMNode(this.refs.button).focus()
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