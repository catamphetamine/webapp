import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'
import styler from 'react-styling'

import React_modal from 'react-modal'

// when changing this also change 
// your .ReactModal__Overlay and .ReactModal__Content 
// css transition times accordingly
const default_close_timeout = 150 // ms

export default class Modal extends Component
{
	static propTypes =
	{
		isOpen         : PropTypes.bool.isRequired,
		onRequestClose : PropTypes.func.isRequired,
		onAfterOpen    : PropTypes.func,
		closeTimeoutMS : PropTypes.number,
		style          : PropTypes.object
	}

	constructor(props, context)
	{
		super(props, context)

		this.onRequestClose = this.onRequestClose.bind(this)
		this.onAfterOpen    = this.onAfterOpen.bind(this)
	}

	render()
	{
		const { isOpen, closeTimeoutMS } = this.props

		const markup = 
		(
			<React_modal
				ref="modal"
				isOpen={isOpen}
				onAfterOpen={this.onAfterOpen}
				onRequestClose={this.onRequestClose}
				closeTimeoutMS={closeTimeoutMS || default_close_timeout}
				className="modal"
				style={style.modal}>

				<div style={style.content_wrapper} onClick={this.onRequestClose}>
					{/* top padding grows less than bottom padding */}
					<div style={style.top_padding} onClick={this.onRequestClose}></div>
					
					{/* dialog window content */}
					<div className="modal-content" onClick={event => event.stopPropagation()} style={this.props.style ? merge(style.content, this.props.style) : style.content}>{this.props.children}</div>

					{/* bottom padding grows more than top padding */}
					<div style={style.bottom_padding} onClick={this.onRequestClose}></div>
				</div>
			</React_modal>
		)

		return markup
	}

	onRequestClose()
	{
		document.body.style.maxWidth = 'none'
		document.body.style.height   = '100%' // it's a good idea to always have it set to 100%
		document.body.style.overflow = 'auto'

		if (this.props.onRequestClose)
		{
			this.props.onRequestClose()
		}
	}

	onAfterOpen()
	{
		document.body.style.maxWidth = document.body.clientWidth + 'px'
		document.body.style.height   = '100%'
		document.body.style.overflow = 'hidden'

		if (this.props.onAfterOpen)
		{
			this.props.onAfterOpen()
		}
	}
}

const style = styler
`
	top_padding
		width : 100%

		flex-grow   : 1
		flex-shrink : 1
		flex-basis  : 20%

	bottom_padding
		width : 100%

		flex-grow   : 7
		flex-shrink : 1
		flex-basis  : 20%

	content
		display : inline-block

		flex-grow   : 0
		flex-shrink : 0
		flex-basis  : auto

		padding-left  : 2em
		padding-right : 2em

		padding-top    : 1.5em
		padding-bottom : 1.5em

		border-radius  : 0.2em
		
		background-color: white

	// вместо использования этого content_wrapper'а
	// можно было бы использовать то же самое на modal.content,
	// но тогда этот слой займёт весь экран, а в react-modal
	// на него вешается onClick со stopPropagation,
	// поэтому клики слева и справа не будут закрывать окошко.
	content_wrapper
		display        : flex
		flex-direction : column
		align-items    : center
		height         : 100%

	modal
		overlay
			height     : 1px
			min-height : 100%

			text-align : center

			background-color: rgba(0, 0, 0, 0.2)

		content
			position : static
			height : 100%

			top    : auto
			left   : auto
			right  : auto
			bottom : auto

			text-align : left

			// margin-left  : auto
			// margin-right : auto

			padding : 0
			border : none
			background-color: transparent

			// вместо обойтись этим и не использовать content_wrapper,
			// но тогда этот слой займёт весь экран, а в react-modal
			// на него вешается onClick со stopPropagation,
			// поэтому клики на нём не будут закрывать окошко.
			//
			// display        : flex
			// flex-direction : column
			// align-items    : center

			// alternative centering (not using flexbox)
			// top                   : 50%
			// left                  : 50%
			// right                 : auto
			// bottom                : auto
			// margin-right          : -50%
			// transform             : translate(-50%, -50%)
			
			display      : table
			margin-left  : auto
			margin-right : auto
`