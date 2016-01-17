import React, { Component, PropTypes } from 'react'

export default class Form extends Component
{
	state = {}

	static propTypes =
	{
		action    : PropTypes.func.isRequired,
		inputs    : PropTypes.func,
		className : PropTypes.string,
		style     : PropTypes.object
	}

	render()
	{
		const { className } = this.props

		const markup = 
		(
			<form className={className} style={this.props.style} onSubmit={::this.submit}>
				{this.props.children}

				{ this.state.error ? <div className="form-error-message">{this.state.error}</div> : null }
			</form>
		)

		return markup
	}

	async submit(event)
	{
		event.preventDefault()

		this.reset_error()

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

		try
		{
			await this.props.action()
		}
		catch (error)
		{
			this.setState({ error: error.message })
			// console.error(error)
		}
	}

	reset_error()
	{
		this.setState({ error: undefined })
	}
}