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
		focus      : PropTypes.func,
		// `error` can be passed for non-javascript
		// web 1.0 forms error rendering support
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
		const { children } = this.props

		return React.Children.map(children, (child) =>
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
	}

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

		const { children, indicate_invalid, set_indicate_invalid } = this.props

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

				this.state.indicate_invalid[name] = true
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