import React, { Component, PropTypes } from 'react'

export default class Form extends Component
{
	state = {}

	static propTypes =
	{
		action    : PropTypes.func,
		inputs    : PropTypes.func,
		error     : PropTypes.any,
		post      : PropTypes.string,
		className : PropTypes.string,
		style     : PropTypes.object
	}

	constructor(props, context)
	{
		super(props, context)
		
		this.on_submit = this.on_submit.bind(this)
		this.submit    = this.submit.bind(this)
	}

	render()
	{
		const { post, error, className } = this.props

		const markup = 
		(
			<form
				onSubmit={this.on_submit}
				action={post}
				method="POST"
				className={className}
				style={this.props.style}>

				{this.props.children}

				{error && <div className="form-error-message">{error.message ? error.message : error}</div>}
			</form>
		)

		return markup
	}

	on_submit(event)
	{
		event.preventDefault()
		this.submit()
	}

	async submit()
	{
		// this.reset_error()

		const { inputs } = this.props

		if (inputs)
		{
			let focus_on

			for (let input of inputs())
			{
				if (!input.validate())
				{
					if (!focus_on)
					{
						focus_on = input
					}
				}
			}

			if (focus_on)
			{
				focus_on.focus({ preserve_validation: true })
				return false
			}
		}

		if (!this.props.action)
		{
			return
		}

		return this.props.action()

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
}