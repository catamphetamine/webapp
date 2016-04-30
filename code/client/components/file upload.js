import React, { PropTypes } from 'react'

export default class File_upload extends React.Component
{
	static propTypes =
	{
		action    : PropTypes.func.isRequired,
		multiple  : PropTypes.bool,
		style     : PropTypes.object,
		className : PropTypes.string
	}

	constructor(props, context)
	{
		super(props, context)

		this.on_file_selected = this.on_file_selected.bind(this)
		this.on_click         = this.on_click.bind(this)
	}

	render()
	{
		const { style, className } = this.props

		const markup = 
		(
			<div
				style={style}
				className={className}
				onClick={this.on_click}>

				<input
					type="file"
					ref="file_upload"
					key="file_input"
					style={{ display: 'none' }}
					onClick={event => event.stopPropagation()}
					onChange={event => this.on_file_selected(event)}/>

				{this.props.children}
			</div>
		)

		return markup

		// const file_input = 
		// 	<input
		// 		type="file"
		// 		ref="file_upload"
		// 		key="file_input"
		// 		style={{ display: 'none' }}
		// 		onClick={event => event.stopPropagation()}
		// 		onChange={event => this.on_file_selected(event)}/>

		// let children = this.props.children.props.children

		// if (!Array.isArray(children))
		// {
		// 	if (typeof children === 'string')
		// 	{
		// 		children = React.createElement('span', { key: 'content' }, children)
		// 	}
		// 	else
		// 	{
		// 		children = React.cloneElement(children, { key: 'content' })
		// 	}

		// 	children = [children]
		// }

		// children.push(file_input)

		// return React.cloneElement(this.props.children, { onClick: this.on_click }, children)
	}

	on_file_selected(event)
	{
		const { action, multiple } = this.props

		let data = event.target.files

		if (!multiple)
		{
			data = data[0]
		}

		action(data)

		// reset the selected file 
		// so that onChange would trigger again 
		// even with the same file
		event.target.value = null
	}

	on_click(event)
	{
		this.refs.file_upload.click()
	}
}