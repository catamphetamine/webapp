import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'
import styler from 'react-styling'
import classNames from 'classnames'

import React_modal from 'react-modal'

import Button from './button'
import default_messages from './messages'

// when changing this also change
// your .ReactModal__Overlay and .ReactModal__Content
// css transition times accordingly
const default_close_timeout = 150 // ms

// when changing this also change
// your .modal--could-not-close-because-busy
// css transition times accordingly
const could_not_close_because_busy_animation_duration = 1500 // ms

export default class Modal extends Component
{
	state = {}

	static propTypes =
	{
		shown            : PropTypes.bool,
		close            : PropTypes.func.isRequired,
		after_open       : PropTypes.func,
		close_timeout    : PropTypes.number,
		title            : PropTypes.string,
		children         : PropTypes.node,
		reset            : PropTypes.func,
		cancel           : PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
		actions          : PropTypes.arrayOf
		(
			PropTypes.shape
			({
				action : PropTypes.func,
				text   : PropTypes.string
			})
		),
		scroll           : PropTypes.bool,
		body_overflow_x  : PropTypes.string.isRequired,
		body_overflow_y  : PropTypes.string.isRequired,
		style            : PropTypes.object,
		className        : PropTypes.string
	}

	static defaultProps =
	{
		body_overflow_x : 'auto',
		// Prevents document width from jumping due to the
		// vertical scrollbar appearance/disappearance
		body_overflow_y : 'scroll'
	}

	static contextTypes =
	{
		intl : PropTypes.object
	}

	constructor(props, context)
	{
		super(props, context)

		this.on_request_close = this.on_request_close.bind(this)
		this.on_after_open    = this.on_after_open.bind(this)

		this.on_window_resize        = this.on_window_resize.bind(this)
		this.restore_document_scroll = this.restore_document_scroll.bind(this)

		this.close_if_not_busy = this.close_if_not_busy.bind(this)
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
		if (next_props.shown === false && this.props.shown === true)
		{
			this.restore_document_scroll()
		}
	}

	componentWillReceiveProps(next_props)
	{
		if (this.props.shown && !next_props.shown)
		{
			const { reset, close_timeout } = this.props

			// Reset modal after its closing animation finishes
			// (to avoid weird content jumping)
			// https://github.com/reactjs/react-modal/issues/214
			if (reset)
			{
				setTimeout(reset, close_timeout || default_close_timeout)
			}
		}
	}

	render()
	{
		const { busy, shown, close_timeout, title, cancel, actions, scroll, children } = this.props
		const { could_not_close_because_busy } = this.state

		const translate = this.context.intl.formatMessage

		const markup =
		(
			<React_modal
				isOpen={shown}
				onAfterOpen={this.on_after_open}
				onRequestClose={this.on_request_close}
				closeTimeoutMS={close_timeout || default_close_timeout}
				className={classNames('modal',
				{
					'modal--could-not-close-because-busy': could_not_close_because_busy
				})}
				style={busy ? style.modal_busy : style.modal}>

				<div style={style.content_wrapper} onClick={this.on_request_close}>
					{/* top padding, grows less than bottom padding */}
					<div style={style.top_padding} onClick={this.on_request_close}></div>

					{/* dialog window title */}
					{title &&
						<h1
							onClick={this.block_event}
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
						onClick={this.block_event}
						style={this.props.style ? { ...style.content, ...this.props.style } : style.content}>

						{this.content()}
					</div>

					{/* dialog window actions */}
					{actions &&
						<div
							className={classNames('modal-actions',
							{
								'modal-actions--separated': scroll
							})}
							onClick={this.block_event}
							style={style.actions}>

							{/* Cancel button */}
							{cancel &&
								<Button
									key="-1"
									disabled={busy}
									action={cancel === true ? this.close_if_not_busy : cancel}>
									{translate(default_messages.cancel)}
								</Button>
							}

							{/* Other buttons ("Next", "OK", ...) */}
							{actions.map((action, i) => <Button key={i} disabled={busy} {...action}>{action.text}</Button>)}
						</div>
					}

					{/* bottom padding, grows more than top padding */}
					<div style={style.bottom_padding} onClick={this.on_request_close}></div>
				</div>
			</React_modal>
		)

		return markup
	}

	content()
	{
		const { children } = this.props

		// if (React.Children.count(children) === 1)
		// {
		// 	return React.cloneElement(React.Children.only(children),
		// 	{
		// 	})
		// }

		return children
	}

	// Play "cannot close" animation on the modal
	indicate_cannot_close()
	{
		if (!this.state.could_not_close_because_busy)
		{
			setTimeout(() =>
			{
				this.setState({ could_not_close_because_busy: false })
			},
			// Give it a bit of extra time to finish the CSS animation
			could_not_close_because_busy_animation_duration * 1.1)

			this.setState({ could_not_close_because_busy: true })
		}
	}

	// Public API method
	close()
	{
		this.close_if_not_busy()
	}

	on_request_close(event)
	{
		const { cancel } = this.props

		// If the modal has an explicit "Cancel" button,
		// allow closing it by hitting "Escape" key,
		// then don't close it on a click outside.
		if (cancel && event && event.type !== 'keydown')
		{
			return this.indicate_cannot_close()
		}

		this.close_if_not_busy()
	}

	close_if_not_busy()
	{
		const { busy, close, close_timeout, reset } = this.props

		// Don't close the modal if it's busy
		if (busy)
		{
			return this.indicate_cannot_close()
		}

		// Restore original `document` scrollbar
		this.restore_document_scroll()

		// Abruptly end "couldn't close" animation to make room for closing animation
		this.setState({ could_not_close_because_busy: false })

		// Close the modal
		if (close)
		{
			close()
		}
	}

	// This solution may break a bit when a user resizes the browser window
	on_after_open()
	{
		const { after_open } = this.props

		const margin_right = this.max_width - document.body.clientWidth

		this.header.style.right = margin_right + 'px'

		document.body.style.marginRight = margin_right + 'px'
		document.body.style.overflow    = 'hidden'

		// If the user scrolled on a previously shown react-modal,
		// then reset that previously scrolled position.
		document.querySelector('.ReactModal__Overlay').scrollTop = 0

		if (after_open)
		{
			after_open()
		}
	}

	restore_document_scroll()
	{
		const { close_timeout, body_overflow_x, body_overflow_y } = this.props

		setTimeout(() =>
		{
			this.header.style.right = 0

			document.body.style.marginRight = 0
			document.body.style.overflowX   = body_overflow_x
			document.body.style.overflowY   = body_overflow_y
		},
		close_timeout || default_close_timeout)
	}

	on_window_resize()
	{
		this.max_width = window.innerWidth
	}

	block_event(event)
	{
		event.stopPropagation()
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

style.modal_busy =
{
	overlay: { ...style.modal.overlay, cursor: 'wait' },
	content: style.modal.content
}
