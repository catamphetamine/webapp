import React, { Component, PropTypes } from 'react'
import { flat as style } from 'react-styling'
import classNames from 'classnames'

import { Form, TextInput } from 'react-responsive-ui'
import { Form as Redux_form, Field } from 'simpler-redux-form'

import Submit from './form/submit'

import default_messages from './messages'
import international from '../international/internationalize'

@international
export class Steps extends Component
{
	state =
	{
		store : {} // cumulative steps data
	}

	static propTypes =
	{
		done      : PropTypes.func.isRequired,
		children  : PropTypes.node.isRequired,
		style     : PropTypes.object,
		className : PropTypes.string
	}

	constructor(props)
	{
		super(props)

		// Initialize first step `key`

		const { children } = this.props

		let first_child_key

		React.Children.forEach(children, (child) =>
		{
			if (!child)
			{
				return
			}

			if (first_child_key)
			{
				return
			}

			if (!child.key)
			{
				throw new Error(`The first step doesn't have a "key" set`)
			}

			first_child_key = child.key
		})

		this.state.step = first_child_key
	}

	render()
	{
		const { className, style, translate } = this.props

		const submit_button =
		(
			<Submit className="button--primary">
				{ this.is_last_step() ? translate(default_messages.done) : translate(default_messages.next) }
			</Submit>
		)

		const markup =
		(
			<div
				className={ className }
				style={ style }>

				{ this.enhance_step(this.current_step(), submit_button) }
			</div>
		)

		return markup
	}

	is_last_step()
	{
		const { children } = this.props
		const { step } = this.state

		let current_step_found
		let has_more_steps

		React.Children.forEach(children, (child) =>
		{
			if (!child)
			{
				return
			}

			if (child.key === step)
			{
				return current_step_found = true
			}

			if (current_step_found)
			{
				has_more_steps = true
			}
		})

		return !has_more_steps
	}

	current_step()
	{
		const { children } = this.props
		const { step } = this.state

		let current_step

		React.Children.forEach(children, (child) =>
		{
			if (!child)
			{
				return
			}

			if (current_step)
			{
				return
			}

			if (child.key === step)
			{
				current_step = child
			}
		})

		return current_step
	}

	next_step_key()
	{
		const { children } = this.props
		const { step } = this.state

		let current_step
		let next_step

		React.Children.forEach(children, (child) =>
		{
			if (!child)
			{
				return
			}

			if (next_step)
			{
				return
			}

			if (child.key === step)
			{
				return current_step = child
			}

			if (current_step)
			{
				next_step = child
			}
		})

		if (!next_step.key)
		{
			throw new Error(`The next step doesn't have a "key" set`)
		}

		return next_step.key
	}

	// Move on to the next step
	next = (store) =>
	{

		// If there are no more steps left, then finished
		if (this.is_last_step())
		{
			return this.finish()
		}

		// Else, if there are more steps left, go to the next one
		// updating the obtained `store` data.
		this.setState
		({
			store,
			step : this.next_step_key()
		})
	}

	// Finish the current steps session ("Done")
	finish = (store) =>
	{
		const { done } = this.props

		this.setState
		({
			store: {}
		})

		done(store)
	}

	enhance_step(step, submit_button)
	{
		const { store } = this.state

		return React.cloneElement(step,
		{
			next   : this.next,
			finish : this.finish,
			state  : store,
			submitButton : submit_button
		})
	}
}

export class Step extends Component
{
	static propTypes =
	{
		component : PropTypes.func.isRequired
	}

	render()
	{
		const { component, ...rest } = this.props

		return React.createElement(component, rest)
	}
}