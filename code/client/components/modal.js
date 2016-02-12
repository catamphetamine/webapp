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
		closeTimeoutMS : PropTypes.number,
		style          : PropTypes.object
	};

	render()
	{
		const { isOpen, onRequestClose, closeTimeoutMS } = this.props

		// style={this.props.style ? merge(style.modal, this.props.style) : style.modal}>

		const markup = 
		(
			<React_modal
				ref="modal"
				isOpen={isOpen}
				onRequestClose={onRequestClose}
				closeTimeoutMS={closeTimeoutMS || default_close_timeout}
				className="modal"
				style={style.modal}>

				{/* top padding grows less than bottom padding */}
				<div style={style.top_padding} onClick={::this.click_overlay}></div>
				
				{/* dialog window content */}
				<div className="modal-content" style={this.props.style ? merge(style.content, this.props.style) : style.content}>{this.props.children}</div>

				{/* bottom padding grows more than top padding */}
				<div style={style.bottom_padding} onClick={::this.click_overlay}></div>
			</React_modal>
		)

		return markup
	}

	click_overlay()
	{
		// close overlay on click
		ReactDOM.findDOMNode(this.refs.modal.portal).click()
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

			// вместо inline-flex можно было бы использовать просто flex,
			// но тогда этот слой займёт весь экран, а в react-modal
			// на него вешается onClick со stopPropagation,
			// поэтому клики на нём не будут закрывать окошко.
			//
			display        : inline-flex
			flex-direction : column
			// align-items    : center

			// alternative centering (not using flexbox)
			// top                   : 50%
			// left                  : 50%
			// right                 : auto
			// bottom                : auto
			// margin-right          : -50%
			// transform             : translate(-50%, -50%)
`