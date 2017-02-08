import React, { Component, PropTypes } from 'react'
import classNames from 'classnames'
import { Form as Redux_form, Field, Submit } from 'simpler-redux-form'

import default_messages from './messages'

import { Form, Button, TextInput } from 'react-responsive-ui'

import international from '../international/internationalize'

@Redux_form
({
	// Either return a `Promise` from the action
	// or provide `submitting` property
	submitting: (state, props) => props.saving
})
@international()
export default class Editable_field extends Component
{
	state = {}

	static propTypes =
	{
		label       : PropTypes.string,
		name        : PropTypes.string,
		value       : PropTypes.any,
		hint        : PropTypes.string,
		error       : PropTypes.string,
		saving      : PropTypes.bool,
		submitting  : PropTypes.bool,
		editing     : PropTypes.bool,
		edit        : PropTypes.func,
		cancel      : PropTypes.func,
		save        : PropTypes.func,
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

		this.cancel = this.cancel.bind(this)
		this.save   = this.save.bind(this)
		this.edit   = this.edit.bind(this)
	}

	render()
	{
		const
		{
			label,
			hint,
			editing,
			submitting,
			error,
			style,
			className,
			children
		}
		= this.props

		const { edit } = this.state

		const markup =
		(
			<div
				className={ classNames('editable-field', className) }
				style={ style }>

				{/* Field label */}
				{ label }

				{/* Hint */}
				{ hint && <p>{ hint }</p> }

				{/* Field value and actions */}
				{ (edit || editing || submitting || error) ? this.render_editing() : this.render_not_editing() }

				{/* Can be used for relevant <Modal/>s */}
				{ children }
			</div>
		)

		return markup
	}

	render_not_editing()
	{
		const { value } = this.props

		const translate = this.props.intl.formatMessage

		const elements = []

		// Display field value
		if (value !== undefined)
		{
			elements.push(<div key="value" className="editable-field__value">{value}</div>)
		}
		else
		{
			// Just so that the button is on the new line
			elements.push(<div key="value"/>)
		}

		// "Change" button
		elements.push
		(
			<Button
				key="change"
				ref={ref => this.change_button = ref}
				action={this.edit}>
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
			error,
			submitting,
			validate,
			email,
			password,
			multiline,
			submit
		}
		= this.props

		const translate = this.props.intl.formatMessage

		const markup =
		(
			<Form
				action={submit(this.save)}
				busy={submitting}
				cancel={this.cancel}>

				{/* Editable text field */}
				<Field
					component={TextInput}
					name={name}
					value={value}
					email={email}
					password={password}
					multiline={multiline}
					placeholder={label}
					error={error}
					validate={validate}/>

				{/* "Cancel" */}
				<Button
					action={this.cancel}
					disabled={submitting}>
					{translate(default_messages.cancel).toLowerCase()}
				</Button>

				{/* "Save" */}
				<Submit
					component={Button}
					submit={true}
					className="editable-field__button--subsequent button--primary">
					{translate(default_messages.save).toLowerCase()}
				</Submit>
			</Form>
		)

		return markup
	}

	cancel()
	{
		if (this.props.cancel)
		{
			this.props.cancel()
		}

		this.setState({ edit: false }, () =>
		{
			this.change_button.focus()
		})
	}

	async save(values)
	{
		const { name, save } = this.props
		const value = values[name]

		// Save the new value (if it changed)
		if (value !== this.props.value)
		{
			const result = save(value)

			if (result && typeof result.then === 'function')
			{
				await result
			}
		}

		// Exit editing mode
		this.setState({ edit: false }, () =>
		{
			// If `save` didn't retain edit mode,
			// then focus on the "Change" button.
			if (this.change_button)
			{
				this.change_button.focus()
			}
		})
	}

	edit()
	{
		const { edit, name, validate, value, focus, set } = this.props

		if (edit)
		{
			return edit()
		}

		set(name, value, validate(value))
		this.setState({ edit: true }, () => focus(name))
	}
}