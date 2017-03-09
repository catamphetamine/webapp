import React, { Component, PropTypes } from 'react'
import classNames from 'classnames'
import { Form as Redux_form, Field } from 'simpler-redux-form'
import { Form, Button, Switch } from 'react-responsive-ui'

import TextInput from './form/text input'
import Submit from './form/submit'
import default_messages from './messages'
import international from '../international/internationalize'

const switch_slide_animation_duration = 250 // ms

@international
@Redux_form
({
	// Either return a `Promise` from the action
	// or provide `submitting` property
	submitting: (state, props) => props.saving,

	// Exposing a public `.cancel()` method
	methods: ['cancel']
})
export default class Editable_field extends Component
{
	state = {}

	static propTypes =
	{
		label       : PropTypes.string,
		emptyLabel  : PropTypes.string,
		emptyEditLabel : PropTypes.string,
		name        : PropTypes.string,
		value       : PropTypes.any,
		hideValue   : PropTypes.bool.isRequired,
		enabled     : PropTypes.bool,
		disable     : PropTypes.func,
		hint        : PropTypes.string,
		error       : PropTypes.string,
		saving      : PropTypes.bool,
		submitting  : PropTypes.bool,
		editing     : PropTypes.bool,
		edit        : PropTypes.func,
		cancel      : PropTypes.func,
		save        : PropTypes.func,
		validate    : PropTypes.func,
		multiline   : PropTypes.bool,
		email       : PropTypes.bool,
		password    : PropTypes.bool,
		style       : PropTypes.object,
		className   : PropTypes.string
	}

	static defaultProps =
	{
		hideValue : false
	}

	constructor(props)
	{
		super(props)

		const { enabled } = this.props

		if (enabled !== undefined)
		{
			this.state.enabled = enabled
		}

		this.save = this.save.bind(this)
	}

	componentWillReceiveProps(new_props)
	{
		if (new_props.enabled !== this.props.enabled)
		{
			this.setState({ enabled: new_props.enabled })
		}
	}

	render()
	{
		const
		{
			label,
			hint,
			editing,
			submitting,
			value,
			error,
			style,
			className,
			children
		}
		= this.props

		const
		{
			edit,
			enabled,
			toggle_animation_pending
		}
		= this.state

		const is_editing = edit || editing || submitting || error

		const markup =
		(
			<div
				className={ classNames('editable-field', className) }
				style={ style }>

				{/* Field label */}
				{ label }

				{/* Toggler */}
				{ enabled !== undefined &&
					<Switch
						value={ enabled }
						onChange={ this.enable_disable }
						disabled={ toggle_animation_pending }/>
				}

				{/* Hint */}
				{ hint && <p>{ hint }</p> }

				{/* Field value and actions */}
				{ value && (is_editing ? this.render_editing() : this.render_not_editing()) }

				{/* Can be used for relevant <Modal/>s */}
				{ children }
			</div>
		)

		return markup
	}

	render_not_editing()
	{
		const
		{
			value,
			hideValue,
			emptyLabel,
			emptyEditLabel,
			translate
		}
		= this.props

		const
		{
			toggle_animation_pending
		}
		= this.state

		const elements = []

		const is_empty = value === undefined || value === null || value === ''

		// Show field value
		elements.push
		((
			<div
				key="value"
				className={ classNames('editable-field__value',
				{
					'editable-field__value--empty' : is_empty
				}) }>
				{ !hideValue && (is_empty ? emptyLabel : value) }
			</div>
		))

		// "Change" button
		elements.push
		(
			<Button
				key="change"
				ref={ ref => this.change_button = ref }
				action={ this.edit }
				disabled={ toggle_animation_pending }>
				{ emptyEditLabel || translate(default_messages.change).toLowerCase() }
			</Button>
		)

		return elements
	}

	render_editing()
	{
		const
		{
			label,
			name,
			value,
			error,
			submitting,
			validate,
			email,
			password,
			multiline,
			submit,
			translate
		}
		= this.props

		const
		{
			toggle_animation_pending
		}
		= this.state

		const markup =
		(
			<Form
				submit={ submit(this.save) }
				busy={ submitting || toggle_animation_pending }
				cancel={ this.cancel }>

				{/* Editable text field */}
				<TextInput
					name={ name }
					value={ value }
					email={ email }
					password={ password }
					multiline={ multiline }
					placeholder={ label }
					error={ error }
					validate={ validate }/>

				{/* "Cancel" */}
				<Button
					action={ this.cancel }
					disabled={ submitting || toggle_animation_pending }>
					{ translate(default_messages.cancel).toLowerCase() }
				</Button>

				{/* "Save" */}
				<Submit
					className="editable-field__button--subsequent">
					{ translate(default_messages.save).toLowerCase() }
				</Submit>
			</Form>
		)

		return markup
	}

	cancel_editing = (callback) =>
	{
		// When `edit: false` is rendered
		// then the form is unmounted
		// and its state is erased
		// therefore the input field value
		// will be cleared automatically.
		this.setState
		({
			edit: false
		},
		callback)
	}

	cancel = () =>
	{
		const { cancel, enabled } = this.props

		if (cancel)
		{
			cancel()
		}

		// If tried to turn it on,
		// then a modal popped up,
		// but changed one's mind
		// and closed the modal.
		if (!enabled && this.state.enabled)
		{
			this.setState({ enabled })
		}
		// If tried to turn it off but changed one's mind
		else if (enabled && !this.state.enabled)
		{
			this.setState({ enabled })
		}

		this.cancel_editing(() =>
		{
			if (this.change_button)
			{
				this.change_button.focus()
			}
		})
	}

	async save(values)
	{
		const { name, save } = this.props
		const value = values[name]

		// Save the new value (if it changed)
		if (value !== this.props.value)
		{
			const result = save(value)

			if (result && typeof result.then === 'function')
			{
				await result
			}
		}

		// Exit editing mode
		this.cancel_editing(() =>
		{
			// If `save` didn't retain edit mode,
			// then focus on the "Change" button.
			if (this.change_button)
			{
				this.change_button.focus()
			}
		})
	}

	edit = () =>
	{
		const { edit, name, validate, value, focus, set } = this.props

		if (edit)
		{
			return edit()
		}

		set(name, value, validate(value))
		this.setState({ edit: true }, () => focus(name))
	}

	enable_disable = (enabled) =>
	{
		const { disable } = this.props

		this.setState
		({
			enabled,
			toggle_animation_pending: true
		},
		() =>
		{
			setTimeout(() =>
			{
				this.setState
				({
					toggle_animation_pending: false
				})

				if (enabled)
				{
					this.edit()
				}
				else
				{
					this.cancel_editing()
					disable()
				}
			},
			switch_slide_animation_duration * 0.8)
		})
	}
}

// Calls `.cancel()` instance method
Editable_field.cancel = (ref) =>
{
	// First `react-intl` wrapper
	ref = ref.refs.wrappedInstance

	// Then `@international` wrapper
	ref = ref.wrappedInstance

	// Then `simpler-redux-form` wrapper
	return ref.cancel()
}