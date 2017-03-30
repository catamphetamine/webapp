import React, { PropTypes, Component } from 'react'
import ReactDOM from 'react-dom'
import classNames from 'classnames'
import { ChromePicker as Color_picker } from 'react-color'

export default class ColorPicker extends Component
{
	static propTypes =
	{
		value     : PropTypes.string,
		onChange  : PropTypes.func.isRequired,
		alignment : PropTypes.string,
		className : PropTypes.string
	}

	state = {}

	componentDidMount()
	{
		document.addEventListener('click', this.document_clicked)
	}

	componentWillUnmount()
	{
		document.removeEventListener('click', this.document_clicked)
	}

	document_clicked = (event) =>
	{
		const node = ReactDOM.findDOMNode(this.container)

		// Don't close the color picker if its expander button has been clicked,
		// or if clicked inside the color picker
		if (node.contains(event.target))
		{
			return
		}

		this.setState({ expanded: false })
	}

	render()
	{
		const { value, alignment, className } = this.props
		const { expanded } = this.state

		const markup =
		(
			<div
				ref={ ref => this.container = ref }
				onKeyDown={ this.on_key_down }
				className={ classNames('rrui__color-picker', className) }>

				<button
					type="button"
					onClick={ this.toggle }
					style={ styles.button }
					className="rrui__color-picker__color-button">

					<div
						className="rrui__color-picker__color"
						style={ {
							width           : '100%',
							height          : '100%',
							borderRadius    : 'inherit',
							backgroundColor : value || 'transparent'
						} }/>
				</button>

				<div
					className={ classNames('rrui__expandable', 'rrui__expandable--overlay', 'rrui__shadow',
					{
						'rrui__expandable--expanded'      : expanded,
						'rrui__expandable--left-aligned'  : alignment === 'left',
						'rrui__expandable--right-aligned' : alignment === 'right'
					}) }>
					<Color_picker
						className={ classNames('rrui__expandable__content',
						{
							'rrui__expandable__content--expanded': expanded
						}) }
						disableAlpha
						color={ value }
						onChangeComplete={ this.color_selected } />
				</div>
			</div>
		)

		return markup
	}

	on_key_down = (event) =>
	{
		if (event.ctrlKey || event.altKey || event.shiftKey || event.metaKey)
		{
			return
		}

		const { expanded } = this.state

		switch (event.keyCode)
		{
			// Collapse on Escape
			case 27:
				// Collapse the list if it's expanded
				if (expanded)
				{
					this.toggle()
				}
				return
		}
	}

	toggle = () =>
	{
		const { expanded } = this.state

		this.setState({ expanded: !expanded })
	}

	color_selected = (color) =>
	{
		const { onChange } = this.props

		onChange(color.hex)

		// this.setState({ value: color.hex })
	}

	// onChange={ this.try_color }

	// try_color = (color, event) =>
	// {
	// 	// Что будет, если нажмёт отмену - сбрасывать как-то color до предудущего selected

	// 	const { onChange } = this.props

	// 	console.log('onChange', color.hex)

	// 	onChange(color.hex)

	// 	// console.log('@@@@@@@@@@ try color', color.hex)

	// 	// color = {
	// 	//   hex: '#333',
	// 	//   rgb: {
	// 	//     r: 51,
	// 	//     g: 51,
	// 	//     b: 51,
	// 	//     a: 1,
	// 	//   },
	// 	//   hsl: {
	// 	//     h: 0,
	// 	//     s: 0,
	// 	//     l: .20,
	// 	//     a: 1,
	// 	//   },
	// 	// }

	// 	// this.setState({ color: color.hex })
	// }
}

const styles =
{
	button:
	{
		width        : '100%',
		height       : '100%',
		borderRadius : 'inherit'
	}
}