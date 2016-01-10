import React, { Component, PropTypes } from 'react'
import styler from 'react-styling'

import React_modal from 'react-modal'

export default class Modal extends Component
{
	static propTypes =
	{
		isOpen         : PropTypes.bool.isRequired,
		onRequestClose : PropTypes.func.isRequired,
		closeTimeoutMS : PropTypes.number,
		style          : PropTypes.object
	}

	render()
	{
		const { isOpen, onRequestClose, closeTimeoutMS } = this.props

		const markup = 
		(
			<React_modal
				isOpen={isOpen}
				onRequestClose={onRequestClose}
				// closeTimeoutMS={closeTimeoutMS}
				style={this.props.style ? merge(style.modal, this.props.style) : style.modal}>

				{this.props.children}
			</React_modal>
		)

		return markup
	}
}

const style = styler
`
	modal
		overlay
			display     : flex
			align-items : center

			background-color: rgba(0, 0, 0, 0.2)

		content
			position : static

			top    : auto
			left   : auto
			right  : auto
			bottom : auto

			margin-left  : auto
			margin-right : auto

			padding-left  : 2em
			padding-right : 2em

			padding-top    : 1.5em
			padding-bottom : 1.5em

			// alternative centering (not using flexbox)
			// top                   : 50%
			// left                  : 50%
			// right                 : auto
			// bottom                : auto
			// margin-right          : -50%
			// transform             : translate(-50%, -50%)
`