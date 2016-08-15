import React, { Component, PropTypes } from 'react'

export default class Form extends Component
{
	state =
	{
		indicate_invalid: {}
	}

	static propTypes =
	{
		fields     : PropTypes.array.isRequired,
		action     : PropTypes.func,
		focus      : PropTypes.func,
		// `error` can be passed for non-javascript web 1.0 forms error rendering support
		error      : PropTypes.any,
		post       : PropTypes.string,
		className  : PropTypes.string,
		style      : PropTypes.object
	}

	constructor(props, context)
	{
		super(props, context)
		
		this.on_submit = this.on_submit.bind(this)
		this.submit    = this.submit.bind(this)
	}

	render()
	{
		const { post, error, className, style } = this.props

		const markup = 
		(
			<form
				onSubmit={this.on_submit}
				action={post}
				method="POST"
				className={className}
				style={style}
				noValidate>

				{this.children()}

				{/* Debug */}
				{/* JSON.stringify(this.state.indicate_invalid) */}

				{error && <div className="form-error-message">{error.message ? error.message : error}</div>}
			</form>
		)

		return markup
	}

	// Adds extra properties to form field elements
	children()
	{
		const { fields, children } = this.props

		return React.Children.map(children, (child) =>
		{
			if (!child || !child.props)
			{
				return child
			}

			// Form field name
			const name = child.props.name

			// If it's not a form field, don't enhance the element
			if (!fields.has(name))
			{
				return child
			}

			// If it's a form field, then add extra properties to it
			return React.cloneElement(child,
			{
				indicate_invalid : this.state.indicate_invalid[name],
				on_change : (value) =>
				{
					child.props.on_change(value)

					// Since the field value changed,
					// it's likely that user is in the process of editing it,
					// so don't show that the field is invalid (if it is).
					this.state.indicate_invalid[name] = false
					this.setState({ indicate_invalid: this.state.indicate_invalid })
				}
			})
		})
	}

	// // Sets "indicate_invalid" of a `name` field to `value`
	// set_field_validity_indication(name, value)
	// {
	// 	this.setState({ indicate_invalid: { ...this.state.indicate_invalid, [name]: value } })
	// }

	// "Enter" key handler
	on_submit(event)
	{
		event.preventDefault()
		this.submit()
	}

	// Submit form
	submit()
	{
		// this.reset_error()

		const { fields, children, indicate_invalid, set_indicate_invalid } = this.props

		// Will focus on the first invalid field
		let first_invalid_field

		// Check validity state for each form field
		for (let field_name of fields)
		{
			// Find field by name
			const field = React.Children.toArray(children).filter((child) =>
			{
				return child.props.name === field_name
			})
			[0]

			if (!field)
			{
				throw new Error(`Field "${field_name}" not found`)
			}

			// If the field is invalid, then the form won't be submitted
			if (exists(field.props.invalid))
			{
				console.log(`[debug] "${field_name}" field is invalid`)

				first_invalid_field = first_invalid_field || field_name

				this.state.indicate_invalid[field_name] = true
			}
		}

		// Apply field validity indication
		this.setState({ indicate_invalid: this.state.indicate_invalid })

		// If there is an invalid field, then focus on it and exit
		if (first_invalid_field)
		{
			if (this.props.focus)
			{
				this.props.focus(first_invalid_field)
			}

			return false
		}

		// Form is valid, and is therefore submitted

		if (this.props.action)
		{
			this.props.action()
		}

		// try
		// {
		// 	await this.props.action()
		// }
		// catch (error)
		// {
		// 	this.setState({ error: error.message })
		// 	// console.error(error)
		// }
	}

	// reset_error()
	// {
	// 	this.setState({ error: undefined })
	// }

	reset_validation_indication()
	{
		this.setState({ indicate_invalid: {} })
	}
}