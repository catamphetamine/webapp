import React, { Component, PropTypes } from 'react'

export default class Form extends Component
{
	state = {};

	static propTypes =
	{
		action    : PropTypes.func,
		inputs    : PropTypes.func,
		error     : PropTypes.any,
		post      : PropTypes.string,
		className : PropTypes.string,
		style     : PropTypes.object
	};

	render()
	{
		const { post, error, className } = this.props

		const markup = 
		(
			<form className={className} style={this.props.style} onSubmit={::this.submit} action={post}>
				{this.props.children}

				{ error ? <div className="form-error-message">{error.message ? error.message : error}</div> : null }
			</form>
		)

		return markup
	}

	async submit(event)
	{
		event.preventDefault()

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
				return focus_on.focus({ preserve_validation: true })
			}
		}

		if (!this.props.action)
		{
			return
		}

		this.props.action()

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