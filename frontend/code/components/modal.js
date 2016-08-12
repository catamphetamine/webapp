import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'
import styler from 'react-styling'
import classNames from 'classnames'

import React_modal from 'react-modal'

import Button from './button'

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

		this.on_window_resize        = this.on_window_resize.bind(this)
		this.restore_document_scroll = this.restore_document_scroll.bind(this)
	}

	componentDidMount()
	{
		this.header = document.querySelector('header')

		window.addEventListener('resize', this.on_window_resize)
		this.on_window_resize()
	}

	componentWillUnmount()
	{
		window.removeEventListener('resize', this.on_window_resize)
		this.restore_document_scroll()
	}

	componentWillUpdate(next_props)
	{
		if (next_props.isOpen === false && this.props.isOpen === true)
		{
			this.restore_document_scroll()
		}
	}

	render()
	{
		const { isOpen, closeTimeoutMS, title, actions, scroll } = this.props

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

					{/* dialog window title */}
					{title &&
						<h1
							onClick={event => event.stopPropagation()}
							className={classNames('modal-header',
							{
								'modal-header--separated': scroll
							})}
							style={style.header}>
							{title}
						</h1>
					}
					
					{/* dialog window content */}
					<div
						className={classNames('modal-content',
						{
							'modal-content--no-bars': !title
						})}
						onClick={event => event.stopPropagation()}
						style={this.props.style ? { ...style.content, ...this.props.style } : style.content}>
						{this.props.children}
					</div>

					{/* dialog window actions */}
					{actions &&
						<div
							className={classNames('modal-actions',
							{
								'modal-actions--separated': scroll
							})}
							onClick={event => event.stopPropagation()}
							style={style.actions}>

							{actions.map((action, i) => <Button key={i} {...action}>{action.text}</Button>)}
						</div>
					}

					{/* bottom padding grows more than top padding */}
					<div style={style.bottom_padding} onClick={this.onRequestClose}></div>
				</div>
			</React_modal>
		)

		return markup
	}

	onRequestClose()
	{
		this.restore_document_scroll()

		if (this.props.onRequestClose)
		{
			this.props.onRequestClose()
		}
	}

	// This solution may break a bit when a user resizes the browser window
	onAfterOpen()
	{
		const margin_right = this.max_width - document.body.clientWidth

		this.header.style.right = margin_right + 'px'

		document.body.style.marginRight = margin_right + 'px'
		document.body.style.overflow    = 'hidden'

		// If the user scrolled on a previously shown react-modal,
		// then reset that previously scrolled position.
		document.querySelector('.ReactModal__Overlay').scrollTop = 0

		if (this.props.onAfterOpen)
		{
			this.props.onAfterOpen()
		}
	}

	restore_document_scroll()
	{
		setTimeout(() =>
		{
			this.header.style.right = 0

			document.body.style.marginRight = 0
			document.body.style.overflow    = 'auto'
		},
		this.props.closeTimeoutMS || default_close_timeout)
	}

	on_window_resize()
	{
		this.max_width = window.innerWidth
	}
}

// https://material.google.com/components/dialogs.html
const style = styler
`
	top_padding
		width : 100%

		flex-grow   : 1
		flex-shrink : 0
		flex-basis  : 80px

	bottom_padding
		width : 100%

		flex-grow   : 4
		flex-shrink : 0
		flex-basis  : 80px

	content, header, actions
		background-color : white

	content
		display : inline-block

		flex-grow   : 0
		flex-shrink : 1
		flex-basis  : auto
		overflow    : auto

		padding-left  : 1.2rem
		padding-right : 1.2rem
		padding-bottom : 1.2rem

	header, actions
		flex-grow   : 0
		flex-shrink : 0
		flex-basis  : auto

		margin : 0
		width  : 100%

		box-sizing: border-box

	header
		text-align : left
		font-size : 1.3rem

	actions
		// height     : 2.4rem
		// max-height : 2.4rem

		text-align : right
		// fixes display inline-block whitespaces causing scrollbar
		line-height : 0

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
			// fixes display inline-block whitespaces causing scrollbar
			line-height : 0

			background-color: rgba(0, 0, 0, 0.2)

		content
			// position : static
			height : 100%

			// top    : auto
			// left   : auto
			// right  : auto
			// bottom : auto

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
			
			// // centering
			// display      : table
			// margin-left  : auto
			// margin-right : auto

			display: inline-block
			line-height: normal

		// content_cell
		// 	// // centering
		// 	// display : table-cell
		// 	height  : 100%
`