import ReactDOM from 'react-dom'

// when input is focused
export function on_focus()
{
	// if don't remove invalid status 
	// from the input after it has been focused,
	// then just exit
	if (this.preserve_validation_on_focus)
	{
		// clearing the flag
		return this.preserve_validation_on_focus = false
	}

	// otherwise, remove invalid status from the input
	this.reset_validation()
}

// when input loses focus
export function on_blur(event)
{
	// const value = event.target.value

	// perform input value validation
	// (and indicate validation status afterwards)
	this.validate()
}

// when input value changes
export function on_change(value)
{
	// reset input value validation status
	this.reset_validation()

	// if it's an event then extract the input value from it
	if (typeof value.preventDefault === 'function')
	{
		value = value.target.value
	}

	// check if the input value has actually changed
	if (this.props.value === value)
	{
		return // input value actually didn't change
	}

	// input value changed, call the method
	// which was passed as a property (on_change={...})
	this.props.on_change(value)
}

// validate input value
export function validate()
{
	const { value, validate } = this.props

	// if no validation specifed then just exit
	if (!validate)
	{
		return true
	}

	// if (this.validation)
	// {
	// 	if (this.validation.cancel)
	// 	{
	// 		this.validation.cancel()
	// 	}
	// }
	//
	// const result = validate(value) ? true : false
	//
	// if (is_promise(result))
	// {
	// 	this.validation = result
	//
	// 	return result.then(valid =>
	// 	{
	// 		if (this.validation === result)
	// 		{
	// 			this.validation = undefined
	// 		}
	//
	// 		this.setState({ valid })
	// 	})
	// }
	// else
	// {
	//	this.setState({ valid: result })
	//	return true
	// }

	// validate input value
	const result = validate(value)

	let valid
	let error_message

	if (!exists(result))
	{
		valid = true
	}
	else if (typeof result === 'boolean')
	{
		valid = result
	}
	else // if (typeof result === 'string')
	{
		valid = false
		error_message = result
	}

	// set validation status and re-render the component
	this.setState({ valid, error_message })
	return valid
}

// focuses on the input
export function focus(options = {})
{
	// if `preserve_validation` flag was passed
	// then don't remove invalid status from the input after it has been focused
	if (options.preserve_validation)
	{
		this.validate()
		this.preserve_validation_on_focus = true
	}

	// focus the input
	ReactDOM.findDOMNode(this.refs.input).focus()
}

// reset input value validation status
export function reset_validation()
{
	this.setState({ valid: undefined, error_message: undefined })
}

// is called in React component constructor
export function inject(component)
{
	component.on_focus         =         on_focus.bind(component)
	component.on_blur          =          on_blur.bind(component)
	component.on_change        =        on_change.bind(component)
	component.focus            =            focus.bind(component)
	component.validate         =         validate.bind(component)
	component.reset_validation = reset_validation.bind(component)
}