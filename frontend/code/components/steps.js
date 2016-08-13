import React, { Component, PropTypes } from 'react'
import styler from 'react-styling'
import classNames from 'classnames'

export default class Steps extends Component
{
	state = {}

	static propTypes =
	{
		children       : PropTypes.node,
		style          : PropTypes.object,
		className      : PropTypes.string
	}

	constructor(props, context)
	{
		super(props, context)

		this.previous = this.previous.bind(this)
		this.next     = this.next.bind(this)
		this.goto     = this.goto.bind(this)

		this.state.step = props.initial_step !== undefined ? props.initial_step : 1
	}

	render()
	{
		const { className } = this.props

		const markup =
		(
			<div>
				{this.content()}
			</div>
		)

		return markup
	}

	content()
	{
		const the_step = React.Children.map(this.props.children, (child) =>
		{
			if (child.props.step !== this.state.step)
			{
				return
			}

			return React.cloneElement(child,
			{
				previous : this.previous,
				next     : this.next,
				goto     : this.goto
			})
		})

		if (the_step.length !== 1)
		{
			throw new Error(`No step #${this.state.step} found`)
		}

		return the_step[0]
	}

	previous()
	{
		if (this.state.step === 0)
		{
			return
		}

		this.goto(this.state.step - 1)
	}

	next()
	{
		if (this.state.step === 0)
		{
			return
		}
		
		this.goto(this.state.step + 1)
	}

	goto(step)
	{
		this.setState({ step })
	}
}