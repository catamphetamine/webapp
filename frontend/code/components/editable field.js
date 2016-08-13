import React, { Component, PropTypes } from 'react'
import styler from 'react-styling'
import classNames from 'classnames'

import default_messages               from './messages'
import { validate as validate_value } from './common'
import Button                         from './button'
import Text_input                     from './text input'

import international from '../international/internationalize'

@international()
export default class Editable_field extends Component
{
	state = {}

	static propTypes =
	{
		label       : PropTypes.string,
		name        : PropTypes.string,
		value       : PropTypes.any,
		on_edit     : PropTypes.func,
		on_save     : PropTypes.func,
		validate    : PropTypes.func,
		multiline   : PropTypes.bool,
		email       : PropTypes.bool,
		password    : PropTypes.bool,
		style       : PropTypes.object,
		className   : PropTypes.string
	}

	constructor(props, context)
	{
		super(props, context)

		this.cancel       = this.cancel.bind(this)
		this.save         = this.save.bind(this)
		this.edit         = this.edit.bind(this)
		this.update_value = this.update_value.bind(this)
	}

	render()
	{
		const { name, label, value, email, password, multiline, className } = this.props
		const { edit, valid, error_message } = this.state
		const translate = this.props.intl.formatMessage

		const markup =
		(
			<div
				className={classNames('editable-field', className)}
				style={this.props.style}>

				{/* Field label */}
				{/* htmlFor={name} */}
				<label>{label}</label>

				{/* Field value */}
				{ !edit && value !== undefined &&
					<div className="editable-field__value">{value}</div>
				}

				{/* "Change" */}
				{ !edit && 
					<Button
						action={this.edit}>
						{translate(default_messages.change).toLowerCase()}
					</Button>
				}

				{/* Text input */}
				{ edit && 
					<Text_input
						value={this.state.value}
						name={name}
						email={email}
						password={password}
						multiline={multiline}
						placeholder={label}
						valid={valid}
						on_change={this.update_value}/>
				}

				{/* "Cancel" */}
				{ edit && 
					<Button
						action={this.cancel}>
						{translate(default_messages.cancel).toLowerCase()}
					</Button>
				}

				{/* "Save" */}
				{ edit && 
					<Button
						action={this.save}
						className="editable-field__button--subsequent">
						{translate(default_messages.save).toLowerCase()}
					</Button>
				}

				{/* Error message */}
				{ valid === false &&
					<div className="text-input-error-message">{error_message}</div>
				}
			</div>
		)

		return markup
	}

	cancel()
	{
		this.setState({ value: undefined, edit: false })
	}

	save()
	{
		const { validate, on_save } = this.props
		const { value } = this.state

		if (validate)
		{
			const { valid, error_message } = validate_value(value, validate)

			// set validation status and re-render the component
			this.setState({ valid, error_message })

			if (!valid)
			{
				return
			}
		}

		on_save(value)

		this.setState({ value: undefined, edit: false })
	}

	edit()
	{
		const { on_edit } = this.props

		if (on_edit)
		{
			return on_edit()
		}

		this.setState({ value: this.props.value, edit: true })
	}

	update_value(value)
	{
		this.setState({ value })
	}
}

const style = styler
`
	row_title
		flex          : 0 0 8em
		overflow      : hidden
		text-overflow : ellipsis
`