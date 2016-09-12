import { Component, createElement, PropTypes } from 'react'
import ReactDOM from 'react-dom'
import { connect } from 'react-redux'

// <Field
// 	name="password"
// 	component={Text_input}
// 	value={...}
// 	validate={...}
// 	error={...}/>
//
// React will optimize form rerendering,
// and in case of adding or removing form fields
// it will reuse <Field/> components for different fields.
// Therefore the need to register and unregister fields
// while preserving all the values (to retain them between rerenders).
//
export default class Field extends Component
{
	static propTypes =
	{
		name      : PropTypes.string.isRequired,
		component : PropTypes.oneOfType([ PropTypes.func, PropTypes.string ]).isRequired,

		value    : PropTypes.any,
		error    : PropTypes.string,
		validate : PropTypes.func,

		children : PropTypes.node
	}

	static defaultProps =
	{
		validate : () => {}
	}

	static contextTypes =
	{
		simpler_redux_form : PropTypes.shape
		({
			get_value            : PropTypes.func.isRequired,
			get_indicate_invalid : PropTypes.func.isRequired,
			get_focus            : PropTypes.func.isRequired,

			register_field           : PropTypes.func.isRequired,
			unregister_field         : PropTypes.func.isRequired,
			indicate_invalid_field   : PropTypes.func.isRequired,
			reset_invalid_indication : PropTypes.func.isRequired,
			update_field_value       : PropTypes.func.isRequired,
			focused_field            : PropTypes.func.isRequired
		})
		.isRequired
	}

	constructor(props, context)
	{
		super(props, context)

		// This field will update itself when its value changes
		// (or when it's invalid indication flag changes)
		this.Connected_field = this.connect_field(props.name, context)

		// Miscellaneous
		this.on_change = this.on_change.bind(this)
		this.focused   = this.focused.bind(this)
	}

	connect_field(name, context)
	{
		return connect
		(
			// The following connected props aren't derived from `state`,
			// but it isn't made without @connect() in this case,
			// because <Form/> doesn't rerender itself, for example,
			// on value change, so a simple React component wrapper
			// would not do.
			//
			(state) =>
			({
				value                  : context.simpler_redux_form.get_value(name),
				indicate_invalid       : context.simpler_redux_form.get_indicate_invalid(name),
				_focus                 : context.simpler_redux_form.get_focus(name),
				form_validation_failed : context.simpler_redux_form.get_form_validation_failed()
			}),
			undefined,
			undefined,
			{
				withRef : true
			}
		)
		(Connectable_field)
	}

	// This is a new form field
	initialize_new_field(props)
	{
		const { name, value, validate } = props
	}

	componentWillMount()
	{
		const { name, value, validate, error } = this.props

		// Register field.
		//
		// Initialize this field with the default value,
		// if it hasn't been edited before (i.e. if it's really new).
		//
		this.context.simpler_redux_form.register_field(name, value, validate(value), error)
	}

	componentWillUnmount()
	{
		const { name } = this.props

		// Unregister field
		this.context.simpler_redux_form.unregister_field(name)
	}

	componentWillReceiveProps(new_props)
	{
		// In case React reused one `<Field/>`` element for another form field
		// (an alternative solution to specifying `key`s on each `<Field/>`)
		if (this.props.name !== new_props.name)
		{
			const { name, value, validate, error } = new_props

			// This field will update itself when its value changes
			// (or when it's invalid indication flag changes)
			this.Connected_field = this.connect_field(name, this.context)

			// Unregister old field
			this.context.simpler_redux_form.unregister_field(this.props.name)

			// Register new field
			//
			// Initialize this field with the default value,
			// if it hasn't been edited before (i.e. if it's really new).
			//
			this.context.simpler_redux_form.register_field(name, value, validate(value), error)
		}
		// Else, if it's the same field
		else
		{
			// If an externally set `error` property is updated,
			// then set `indicate_invalid` to `true` for this field.
			this.show_or_hide_externally_set_error(this.props, new_props, this.context)
		}
	}

	// If an externally set `error` property is updated to another error,
	// and the field is not already being indicated as invalid,
	// then set `state.form[form].indicate_invalid[field]` to `true`.
	//
	// If an externally set `error` property is unset,
	// and the field has no validation error,
	// then set `state.form[form].indicate_invalid[field]` to `false`.
	//
	show_or_hide_externally_set_error(props, new_props, context)
	{
		if (props.error !== new_props.error)
		{
			const { name, error, value, validate, indicate_invalid } = new_props

			if (!props.error && error && !indicate_invalid)
			{
				context.simpler_redux_form.indicate_invalid_field(props.name)
			}
			else if (props.error && !error && indicate_invalid && !validate(value))
			{
				// So that `indicate_invalid === true` always means that
				// there is a non-empty `error`.
				// And if there's no error then `indicate_invalid` is always `false`.
				context.simpler_redux_form.reset_invalid_indication(props.name)
			}

			// The rest (imaginary) case is when the `error` is cleared
			// but the validation doesn't pass,
			// and it's uncertain whether to
			// indicate this field as invalid or not.
		}
	}

	// `onChange` field value handler
	on_change(value)
	{
		// If it's an event then extract the input value from it
		if (typeof value.preventDefault === 'function')
		{
			// The `value` is trimmed by now which is handy
			value = value.target.value
		}

		const { name, validate } = this.props

		this.context.simpler_redux_form.update_field_value(name, value, validate(value))
	}

	// Focuses on a field (can be called externally through a ref)
	focus()
	{
		this.refs.field.getWrappedInstance().focus()
		this.focused()
	}

	// Focus on a field was requested and performed
	focused()
	{
		const { name } = this.props

		this.context.simpler_redux_form.focused_field(name)
	}

	render()
	{
		// For custom React components
		return createElement(this.Connected_field,
		{
			...this.props,
			ref       : 'field',
			on_change : this.on_change,
			focused   : this.focused,
			disabled  : this.context.simpler_redux_form.is_busy()
		})
	}
}

// This component will be connected to Redux store
// and therefore will update itself when its value changes.
class Connectable_field extends Component
{
	static propTypes =
	{
		name     : PropTypes.string,
		disabled : PropTypes.bool,

		value                  : PropTypes.any,
		indicate_invalid       : PropTypes.bool,
		_focus                 : PropTypes.bool,
		form_validation_failed : PropTypes.bool,

		validate : PropTypes.func,
		error    : PropTypes.string,

		on_change : PropTypes.func.isRequired,
		focused   : PropTypes.func.isRequired
	}

	constructor(props, context)
	{
		super(props, context)

		this.focus = this.focus.bind(this)

		// If this field is being focused programmatically, then do it.
		this.focus_if_requested({}, props, context)
	}

	componentWillReceiveProps(new_props)
	{
		// If this field is being focused programmatically, then do it.
		this.focus_if_requested(this.props, new_props, this.context)
	}

	// If this field is being focused programmatically, then do it.
	focus_if_requested(props, new_props, context)
	{
		if (!props._focus && new_props._focus)
		{
			// Focus the field.
			// Do it in a timeout, otherwise it didn't work.
			// Probably because React rerenders this field
			// because the `props` have changed
			// and that discards the focus.
			new_props.focused()
			setTimeout(this.focus, 0)
		}
	}

	// Focuses the field (e.g. in case of validation errors)
	focus()
	{
		// If the form hasn't been unmounted yet
		if (this.refs.field)
		{
			// If the custom React component has a `.focus()` instance method
			if (this.refs.field.focus)
			{
				return this.refs.field.focus()
			}

			// Generic focusing
			ReactDOM.findDOMNode(this.refs.field).focus()
		}
	}

	render()
	{
		// These props will be passed down to the field
		const rest_props = {}

		// Filter out inner props
		for (let prop of Object.keys(this.props))
		{
			if (connectable_field_inner_props.indexOf(prop) < 0)
			{
				rest_props[prop] = this.props[prop]
			}
		}

		// Retain some of them
		rest_props.name     = this.props.name
		rest_props.value    = this.props.value
		rest_props.disabled = this.props.disabled

		let
		{
			component,
			value,
			error,
			validate,
			indicate_invalid,
			form_validation_failed,
			on_change
		}
		= this.props

		// Don't show external error if form validation failed
		if (indicate_invalid && form_validation_failed)
		{
			error            = validate(value)
			indicate_invalid = error ? true : false
		}
		else
		{
			error = error || validate(value)
		}

		// Required for focusing on the field in case of validation errors
		rest_props.ref = 'field'

		// For generic Html elements (<input/>, etc)
		if (typeof component === 'string')
		{
			return createElement(component,
			{
				...rest_props,
				onChange : on_change
			})
		}

		// For custom React components
		return createElement(component,
		{
			...rest_props,
			on_change,
			onChange : on_change,
			indicate_invalid,
			indicateInvalid : indicate_invalid,
			error
		})
	}
}

const connectable_field_inner_props = Object.keys(Connectable_field.propTypes)