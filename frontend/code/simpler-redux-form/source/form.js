import { Component, createElement, PropTypes } from 'react'
import hoist_statics          from 'hoist-non-react-statics'
import { bindActionCreators } from 'redux'
import { connect }            from 'react-redux'

import
{
	initialize_form,
	destroy_form,
	register_field,
	unregister_field,
	update_field_value,
	indicate_invalid_field,
	reset_form_invalid_indication,
	clear_field,
	focus_field,
	focused_field,
	set_form_validation_passed
}
from './actions'

import { initial_form_state } from './reducer'

const _initial_form_state_ = initial_form_state()

const reserved_props =
[
	// @connect()-ed Redux state props
	'fields',
	'values',
	'errors',
	'indicate_invalid',
	'focus',
	'misc',

	// Props passed to the underlying form
	'submit',
	'focus',
	'clear',
	'reset_invalid_indication'
]

// <Form
// 	action={this.submit}>
//
// 	<Field
// 		component={Text_input}
// 		value="Text"
// 		validate={this.validate_email}
// 		error="Optional externally set error (aside validation)"/>
//
// 	<button type="submit">Submit</button>
// </Form>
//
// validate_email(value) { return 'Error message' }
//
// submit(values) { ... }
//
export default function Form(options = {})
{
	return function(Wrapped)
	{
		class Form extends Component
		{
			static propTypes =
			{
				// External prop
				form_id : PropTypes.string,
				formId  : PropTypes.string,

				busy : PropTypes.bool,

				fields           : PropTypes.object.isRequired,
				values           : PropTypes.object.isRequired,
				errors           : PropTypes.object.isRequired,
				indicate_invalid : PropTypes.object.isRequired,
				focus            : PropTypes.object.isRequired,
				misc             : PropTypes.object.isRequired,

				initialize_form : PropTypes.func.isRequired,
				destroy_form    : PropTypes.func.isRequired,

				register_field                : PropTypes.func.isRequired,
				unregister_field              : PropTypes.func.isRequired,
				update_field_value            : PropTypes.func.isRequired,
				indicate_invalid_field        : PropTypes.func.isRequired,
				clear_field                   : PropTypes.func.isRequired,
				focus_field                   : PropTypes.func.isRequired,
				focused_field                 : PropTypes.func.isRequired,
				set_form_validation_passed    : PropTypes.func.isRequired,
				reset_form_invalid_indication : PropTypes.func.isRequired
			}

			static childContextTypes =
			{
				simpler_redux_form : PropTypes.object.isRequired
			}

			constructor(props, context)
			{
				super(props, context)

				this.get_value                  = this.get_value.bind(this)
				this.get_indicate_invalid       = this.get_indicate_invalid.bind(this)
				this.get_focus                  = this.get_focus.bind(this)
				this.get_form_validation_failed = this.get_form_validation_failed.bind(this)

				this.is_busy = this.is_busy.bind(this)

				this.register_field           = this.register_field.bind(this)
				this.unregister_field         = this.unregister_field.bind(this)
				this.update_field_value       = this.update_field_value.bind(this)
				this.indicate_invalid_field   = this.indicate_invalid_field.bind(this)
				this.reset_invalid_indication = this.reset_invalid_indication.bind(this)
				this.focused_field            = this.focused_field.bind(this)

				this.submit = this.submit.bind(this)
				this.focus_field = this.focus_field.bind(this)
				this.clear_field = this.clear_field.bind(this)
			}

			componentWillMount()
			{
				this.props.initialize_form(this.form_id())
			}

			componentWillUnmount()
			{
				this.props.destroy_form(this.form_id())
			}

			getChildContext()
			{
				const context =
				{
					simpler_redux_form:
					{
						get_value                  : this.get_value,
						get_indicate_invalid       : this.get_indicate_invalid,
						get_focus                  : this.get_focus,
						get_form_validation_failed : this.get_form_validation_failed,

						is_busy : this.is_busy,

						register_field           : this.register_field,
						unregister_field         : this.unregister_field,
						update_field_value       : this.update_field_value,
						indicate_invalid_field   : this.indicate_invalid_field,
						reset_invalid_indication : this.reset_invalid_indication,
						focused_field            : this.focused_field
					}
            }

            return context
			}

			// Public API
			focus(field)
			{
				if (!field)
				{
					const { fields } = this.props

					field = Object.keys(fields)[0]
				}

				if (field)
				{
					this.focus_field(field)
				}
			}

			// Not all of `this.props` are passed
			passed_props()
			{
				const passed_props = {}

				// Drop all inner props,
				// retaining 'form_id' and 'busy',
				// and also all other possible user-specified props.
				for (let prop_name of Object.keys(this.props))
				{
					if (Form.propTypes[prop_name])
					{
						if (prop_name !== 'form_id'
							&& prop_name !== 'formId'
							&& prop_name !== 'busy')
						{
							continue
						}
					}

					passed_props[prop_name] = this.props[prop_name]
				}

				return passed_props
			}

			// Extracts form id from `props`
			form_id()
			{
				return form_id(this.props)
			}

			// Is submit in progress
			is_busy()
			{
				return this.props.busy
			}

			// Is called from outside
			reset_invalid_indication()
			{
				this.props.reset_invalid_indication(this.form_id())
			}

			// Registers field (used because React optimizes rerendering process)
			register_field(field, value, error, non_validation_error)
			{
				this.props.register_field(this.form_id(), field, value, error, non_validation_error)
			}

			// Unregisters field (used because React optimizes rerendering process)
			unregister_field(field)
			{
				this.props.unregister_field(this.form_id(), field)
			}

			// Field `onChange` handler fires
			update_field_value(field, value, error)
			{
				this.props.update_field_value(this.form_id(), field, value, error)
			}

			// Enables invalid field indication
			indicate_invalid_field(field)
			{
				this.props.indicate_invalid_field(this.form_id(), field)
			}

			// Reset invalid indication for a field
			reset_invalid_indication(field)
			{
				this.props.reset_form_invalid_indication(this.form_id(), field)
			}

			// Returns form values
			get_value(field)
			{
				return this.props.values[field]
			}

			// Invalid field indication
			get_indicate_invalid(field)
			{
				return this.props.indicate_invalid[field]
			}

			// Focusing on a field
			get_focus(field)
			{
				return this.props.focus[field]
			}

			// Did form validation pass
			get_form_validation_failed()
			{
				return this.props.misc.validation_failed
			}

			// Submits the form if it's valid.
			// Otherwise marks invalid fields.
			validate_and_submit(action)
			{
				const { fields, values, errors, set_form_validation_passed } = this.props

				// Ignores previous form submission errors until validation passes
				set_form_validation_passed(this.form_id(), false)

				// Check if there are any invalid fields
				const invalid_fields = Object.keys(fields)
					.filter(field => fields[field])
					.filter(field => errors[field] !== undefined)

				// If all fields are valid, then submit the form
				if (invalid_fields.length === 0)
				{
					// Stop ignoring form submission errors
					set_form_validation_passed(this.form_id(), true)

					const form_data = {}

					// Pass only registered fields to form submit action
					// (because if a field is unregistered that means that
					//  its React element was removed in the process,
					//  and therefore it's not needed anymore)
					for (let key of Object.keys(fields))
					{
						form_data[key] = values[key]
					}

					return action(form_data)
				}

				// Indicate the first invalid field error
				this.indicate_invalid_field(invalid_fields[0])

				// Focus the invalid field
				this.focus_field(invalid_fields[0])
			}

			// Creates form submit handler
			// (this function is passed as a property)
			submit(before_submit, action)
			{
				if (!action)
				{
					action = before_submit
					before_submit = undefined
				}

				if (!action)
				{
					throw new Error(`No action specified for form "submit"`)
				}

				return (event) =>
				{
					// If it's an event handler then `.preventDefault()` it
					if (event && typeof event.preventDefault === 'function')
					{
						event.preventDefault()
					}

					// Do nothing if the form is busy
					// (i.e. submit is in progress)
					if (this.props.busy)
					{
						return
					}

					// Can be used, for example, to reset
					// custom error messages.
					if (before_submit)
					{
						before_submit()
					}

					// Check field validity and submit the form
					this.validate_and_submit(action)
				}
			}

			// Focuses on a given form field
			focus_field(field)
			{
				this.props.focus_field(this.form_id(), field)
			}

			// Clears field value
			clear_field(field, error)
			{
				this.props.clear_field(this.form_id(), field, error)
			}

			// Focus on a field was requested and was performed
			focused_field(field)
			{
				this.props.focused_field(this.form_id(), field)
			}

			render()
			{
				return createElement(Wrapped,
				{
					...this.passed_props(),
					submit : this.submit,
					focus  : this.focus_field,
					clear  : this.clear_field,
					reset_invalid_indication : this.reset_invalid_indication
				})
			}
		}

		Form.displayName = `Form(${get_display_name(Wrapped)})`

		// `this.intl` will be available for this component
		const Connected_form = connect
		(
			(state, props) =>
			{
				const _form_id = form_id(props)

				if (!_form_id)
				{
					throw new Error("`formId` property not specified on `simpler-redux-form` component")
				}

				for (let prop of Object.keys(props))
				{
					if (reserved_props.indexOf(prop) >= 0)
					{
						throw new Error(`"${prop}" prop is reserved by simpler-redux-form`)
					}
				}

				let form_state = state.form[_form_id]

				if (!form_state)
				{
					form_state = { ..._initial_form_state_ }
				}

				if (options.busy)
				{
					// This is needed for Redux store listener
					// shallow compare to actually go into the object.
					// Otherwise it will just see that `before === after`
					// and won't rerender React component.
					form_state = { ...form_state }

					form_state.busy = options.busy(state, props)
				}

				return form_state
			},
			{
				initialize_form,
				destroy_form,
				register_field,
				unregister_field,
				update_field_value,
				indicate_invalid_field,
				reset_form_invalid_indication,
				clear_field,
				focus_field,
				focused_field,
				set_form_validation_passed
			},
			undefined,
			{ withRef: true }
		)
		(Form)

		hoist_statics(Connected_form, Wrapped)

		// Build outer component to expose instance api
		return class ReduxForm extends Component
		{
			constructor(props, context)
			{
				super(props, context)

				this.focus = this.focus.bind(this)
			}

			focus()
			{
				return this.refs.wrapped.getWrappedInstance().focus()
			}

			clear(field, error)
			{
				return this.refs.wrapped.getWrappedInstance().clear_field(field, error)
			}

			// // For tests
			// get wrappedInstance()
			// {
			// 	return this.refs.wrapped.getWrappedInstance().refs.wrapped
			// }

			render()
			{
				return createElement(Connected_form,
				{
					...this.props,
					ref : 'wrapped'
				})
			}
		}
	}
}

function get_display_name(Wrapped)
{
	return Wrapped.displayName || Wrapped.name || 'Component'
}

function form_id(props)
{
	return props.form_id || props.formId
}