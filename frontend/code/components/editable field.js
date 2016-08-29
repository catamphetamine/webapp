import React, { Component, PropTypes } from 'react'
import styler from 'react-styling'
import classNames from 'classnames'

import default_messages from './messages'
import Form             from './form'
import Button           from './button'
import Text_input       from './text input'

import international from '../international/internationalize'

@international()
export default class Editable_field extends Component
{
	state = {}

	static propTypes =
	{
		label       : PropTypes.string,
		name        : PropTypes.string.isRequired,
		value       : PropTypes.any,
		saving      : PropTypes.bool,
		editing     : PropTypes.bool,
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
		this.focus        = this.focus.bind(this)
	}

	render()
	{
		const
		{
			label,
			editing,
			saving,
			className,
			children
		}
		= this.props

		const { edit } = this.state

		const markup =
		(
			<div
				className={classNames('editable-field', className)}
				style={this.props.style}>

				{/* Field label */}
				{/* htmlFor={name} */}
				<label>{label}</label>

				{/* Field value and actions */}
				{ (edit || editing || saving) ? this.render_editing() : this.render_not_editing() }

				{/* Can be used for relevant <Modal/>s */}
				{children}
			</div>
		)

		return markup
	}

	render_not_editing()
	{
		const
		{
			value,
			saving
		}
		= this.props

		const translate = this.props.intl.formatMessage

		const elements = []

		// Display field value
		if (value !== undefined)
		{
			elements.push(<div key="value" className="editable-field__value">{value}</div>)
		}

		// "Change" button
		elements.push
		(
			<Button
				key="change"
				action={this.edit}
				disabled={saving}>
				{translate(default_messages.change).toLowerCase()}
			</Button>
		)

		return elements
	}

	render_editing()
	{
		const
		{
			label,
			name,
			value,
			validate,
			email,
			password,
			multiline,
			saving
		}
		= this.props

		const translate = this.props.intl.formatMessage

		const markup =
		(
			<Form
				focus={this.focus}
				action={this.save}
				busy={saving}>

				{/* Editable text field */}
				<Text_input
					value={this.state.value}
					ref={name}
					name={name}
					email={email}
					password={password}
					multiline={multiline}
					placeholder={label}
					invalid={validate(this.state.value)}
					disabled={saving}
					on_change={this.update_value}/>

				{/* Validation debugging */}
				{/* JSON.stringify(this.state.valid) */}

				{/* "Cancel" */}
				<Button
					action={this.cancel}
					disabled={saving}>
					{translate(default_messages.cancel).toLowerCase()}
				</Button>

				{/* "Save" */}
				<Button
					submit={true}
					busy={saving}
					className="editable-field__button--subsequent">
					{translate(default_messages.save).toLowerCase()}
				</Button>
			</Form>
		)

		return markup
	}

	cancel()
	{
		this.setState({ value: undefined, edit: false })
	}

	save()
	{
		const { on_save } = this.props
		const { value } = this.state

		on_save(value)

		this.setState({ edit : false })
	}

	edit()
	{
		const { on_edit, name, validate, value } = this.props

		// // Validate the input value the first time
		// if (validate)
		// {
		// 	this.setState({ valid: is_valid(value) })
		// }

		if (on_edit)
		{
			return on_edit()
		}

		this.setState({ value, edit: true })

		setTimeout(() => this.refs[name].focus(), 0)
	}

	update_value(value)
	{
		this.setState({ value })
	}

	focus(name)
	{
		return this.refs[name].focus() // { preserve_validation: true }
	}
}

const style = styler
`
	row_title
		flex          : 0 0 8em
		overflow      : hidden
		text-overflow : ellipsis
`