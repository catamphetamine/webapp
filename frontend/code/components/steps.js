import React, { Component, PropTypes } from 'react'
import styler from 'react-styling'
import classNames from 'classnames'

export default class Steps extends Component
{
	state = {}

	static propTypes =
	{
		step           : PropTypes.number.isRequired,
		children       : PropTypes.node,
		style          : PropTypes.object,
		className      : PropTypes.string
	}

	constructor(props, context)
	{
		super(props, context)

		// this.previous = this.previous.bind(this)
		// this.next     = this.next.bind(this)
		// this.goto     = this.goto.bind(this)

		// this.state.step = props.initial_step !== undefined ? props.initial_step : 1
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

	// step()
	// {
	// 	return this.state.step
	// }

	count()
	{
		return React.Children.count(this.props.children)
	}

	current_step()
	{
		return React.Children.toArray(this.props.children).filter((child, index) =>
		{
			// child.props.step
			return index + 1 === this.props.step // this.state.step
		})
		[0]
	}

	content()
	{
		const the_step = this.current_step()

		if (!the_step)
		{
			throw new Error(`No step #${this.props.step} found`) // this.state.step
		}

		return the_step
	}

	// previous()
	// {
	// 	if (this.state.step === 1)
	// 	{
	// 		return
	// 	}

	// 	return this.goto(this.state.step - 1)
	// }

	// next()
	// {
	// 	return this.goto(this.state.step + 1)
	// }

	// done()
	// {
	// 	return this.state.step
	// }

	// goto(step)
	// {
	// 	this.setState({ step })
	// 	return step
	// }
}