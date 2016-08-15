import React, { Component, PropTypes } from 'react'
import styler from 'react-styling'
import classNames from 'classnames'

export default class Steps extends Component
{
	state =
	{
		step  : 1, // start with step No 1
		store : {} // cumulative steps data
	}

	static propTypes =
	{
		on_busy       : PropTypes.func,
		on_idle       : PropTypes.func,
		set_last_step : PropTypes.func.isRequired,
		on_finished   : PropTypes.func.isRequired,
		children      : PropTypes.node.isRequired,
		style         : PropTypes.object,
		className     : PropTypes.string
	}

	constructor(props, context)
	{
		super(props, context)

		this.step   = this.step.bind(this)
		this.submit = this.submit.bind(this)
		this.next   = this.next.bind(this)
	}

	render()
	{
		const { className, style } = this.props

		const markup =
		(
			<div className={className} style={style}>
				{this.enhance_step(this.current_step_element())}
			</div>
		)

		return markup
	}

	enhance_step(step)
	{
		return React.cloneElement(step,
		{
			ref     : this.step,
			submit  : this.next,
			on_busy : this.props.on_busy,
			state   : this.state.store
		})
	}

	current_step_element()
	{
		const step = React.Children.toArray(this.props.children).filter((child, index) =>
		{
			return index + 1 === this.state.step
		})
		[0]

		if (!step)
		{
			throw new Error(`No step #${this.state.step} found`)
		}

		return step
	}

	step_count()
	{
		return React.Children.count(this.props.children)
	}

	// ref={this.step}
	step(component)
	{
		// Will be .submit()-ted
		this.current_step = component
	}

	submit()
	{
		this.setState({ busy: true })
		this.current_step.submit()
	}

	next(store)
	{
		if (this.props.on_idle)
		{
			this.props.on_idle()
		}
		
		// If current step submission succeeded, then move on to the next step

		// If there are no more steps left, then finished
		if (this.state.step === this.step_count())
		{
			this.setState({ store: {} })
			this.props.on_finished(store)
			return
		}

		// Else, if there are more steps left, go to the next one
		// updating the obtained `store` data.
		this.setState({ store, step: this.state.step + 1 })

		// Check if the new step is gonna be the last one
		this.props.set_last_step(this.state.step + 1 === this.step_count())
	}
}
