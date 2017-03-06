import React, { Component, PropTypes } from 'react'
import { flat as style } from 'react-styling'
import classNames from 'classnames'

import { Form, TextInput } from 'react-responsive-ui'
import { Form as Redux_form, Field } from 'simpler-redux-form'

export default class Steps extends Component
{
	state =
	{
		step  : 1, // start with step No 1
		store : {} // cumulative steps data
	}

	static propTypes =
	{
		set_last_step : PropTypes.func,
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
		this.current_step.submit()
	}

	next(store)
	{
		const { set_last_step, on_finished } = this.props
		const { step } = this.state

		// If current step submission succeeded, then move on to the next step

		// If there are no more steps left, then finished
		if (step === this.step_count())
		{
			this.setState({ store: {} })
			on_finished(store)
			return
		}

		// Else, if there are more steps left, go to the next one
		// updating the obtained `store` data.
		this.setState({ store, step: step + 1 })

		// Check if the new step is gonna be the last one
		if (set_last_step)
		{
			set_last_step(step + 1 === this.step_count())
		}
	}
}

@Redux_form
({
	methods: ['submit']
})
export class Text_input_step extends Component
{
	state = {}

	static propTypes =
	{
		action      : PropTypes.func.isRequired,
		submit      : PropTypes.func.isRequired,
		value       : PropTypes.string,
		description : PropTypes.string,
		placeholder : PropTypes.string,
		password    : PropTypes.bool,
		email       : PropTypes.bool,
		submit      : PropTypes.func.isRequired,
		reset_error : PropTypes.func,
		busy        : PropTypes.bool,
		error       : PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
		input_error : PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
		validate    : PropTypes.func,
		className   : PropTypes.string,
		style       : PropTypes.object
	}

	constructor()
	{
		super()

		this.submit = this.submit.bind(this)
	}

	render()
	{
		const
		{
			value,
			email,
			password,
			description,
			placeholder,
			error,
			input_error,
			validate,
			busy,
			action,
			submit,
			reset_error
		}
		= this.props

		const markup =
		(
			<Form
				ref={ ref => this.form = ref }
				busy={ busy }
				submit={ submit(reset_error, action) }
				error={ error }>

				{ description &&
					<p className="rrui__form__field-description">
						{ description }
					</p>
				}

				<Field
					component={ TextInput }
					name="input"
					email={ email }
					password={ password }
					placeholder={ placeholder }
					value={ value }
					disabled={ busy }
					error={ input_error }
					validate={ validate }/>
			</Form>
		)

		return markup
	}

	// Public API
	submit()
	{
		this.form.submit()
	}
}