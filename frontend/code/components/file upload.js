import React, { PropTypes } from 'react'

export default class File_upload extends React.Component
{
	static propTypes =
	{
		action    : PropTypes.func.isRequired,
		multiple  : PropTypes.bool,
		disabled  : PropTypes.bool,
		on_choose : PropTypes.func,
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
					ref={ref => this.file_upload = ref}
					key="file_input"
					style={{ display: 'none' }}
					onClick={event => event.stopPropagation()}
					onChange={event => this.on_file_selected(event)}/>

				{this.props.children}
			</div>
		)

		return markup
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
		if (this.props.disabled)
		{
			return event.preventDefault()
		}

		if (this.props.on_choose)
		{
			this.props.on_choose()
		}

		this.file_upload.click()
	}
}