import React, { Component, PropTypes } from 'react'

export default class Form extends Component
{
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
			</form>
		)

		return markup
	}

	submit(event)
	{
		event.preventDefault()

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

		this.props.action()
	}
}