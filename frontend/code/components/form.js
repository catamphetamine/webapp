import React, { Component, PropTypes } from 'react'

export default class Form extends Component
{
	state =
	{
		indicate_invalid: {}
	}

	static propTypes =
	{
		action     : PropTypes.func,
		on_submit  : PropTypes.func,
		focus      : PropTypes.func,
		// `error` can be passed for non-javascript
		// web 1.0 forms error rendering support
		error      : PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
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

				{this.children(error && <div key="form-errors" className="form-error-message">{error.message ? error.message : error}</div>)}

				{/* Debug */}
				{/* JSON.stringify(this.state.indicate_invalid) */}
			</form>
		)

		return markup
	}

	// Adds extra properties to form field elements
	children(errors)
	{
		const { children } = this.props

		const form_elements = React.Children.toArray(children).map((child) =>
		{
			if (!child || !child.props)
			{
				return child
			}

			const { name, on_change } = child.props

			// If it has a `name` and `on_change` handler
			// then it's likely an input field
			if (!name || !on_change)
			{
				return child
			}

			// If it's a form field, then add extra properties to it
			return React.cloneElement(child,
			{
				indicate_invalid : this.state.indicate_invalid[name],
				on_change : (value) =>
				{
					on_change(value)

					// Since the field value changed,
					// it's likely that user is in the process of editing it,
					// so don't show that the field is invalid (if it is).
					this.state.indicate_invalid[name] = false
					this.setState({ indicate_invalid: this.state.indicate_invalid })
				}
			})
		})

		// Insert `errors` element
		if (errors)
		{
			let errors_inserted = false

			// Show form errors above form actions,
			// so that the errors will be visible and won't be overlooked.
			let index = 0
			for (let child of form_elements)
			{
				if (child.type === Form_actions)
				{
					// React children's children's props are protected,
					// and this would throw "can't add property object is not extensible".
					//
					// // If the form is busy,
					// // then mark all its action buttons as busy too.
					// // (while retaining the original button business, if set)
					// for (let form_action of child.props.children)
					// {
					// 	form_action.props.busy = form_action.props.busy === true || busy === true
					// }

					form_elements.insert_at(index, errors)
					errors_inserted = true
					break
				}
				index++
			}

			if (!errors_inserted)
			{
				form_elements.push(errors)
			}
		}

		return form_elements
	}

	// "Enter" key handler
	on_submit(event)
	{
		event.preventDefault()

		// Prevent form double submit
		if (this.props.busy)
		{
			return
		}

		this.submit()
	}

	// Submit form
	submit()
	{
		// this.reset_error()

		const { on_submit, children, indicate_invalid, set_indicate_invalid } = this.props

		if (on_submit)
		{
			on_submit()
		}

		// Will focus on the first invalid field
		let first_invalid_field

		// Check validity state for each form field
		for (let child of React.Children.toArray(children))
		{
			if (!child || !child.props)
			{
				continue
			}

			const { name, on_change, invalid } = child.props

			// If it has a `name` and `on_change` handler
			// then it's likely an input field
			if (!name || !on_change)
			{
				continue
			}

			// If the field is invalid, then the form won't be submitted
			if (exists(invalid))
			{
				console.log(`[debug] "${name}" field is invalid`)

				first_invalid_field = first_invalid_field || name
			}

			// Indicate invalid, if the field is invalid
			// (if the field is valid then there will be nothing to indicate)
			this.state.indicate_invalid[name] = true
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

export function Form_actions(props, context)
{
	const { children, className, style } = props

	return <div className={className} style={style}>{children}</div>
}