import ReactDOM from 'react-dom'

export function on_focus()
{
	if (this.preserve_validation_on_focus)
	{
		return this.preserve_validation_on_focus = false
	}

	this.reset_validation()
}

export function on_blur(event)
{
	// const value = event.target.value

	this.validate()
}

export function on_change(event)
{
	this.reset_validation()

	this.props.on_change(event.target.value)
}

export function validate()
{
	const { value, validate } = this.props

	if (!validate)
	{
		return
	}

	if (this.validation)
	{
		if (this.validation.cancel)
		{
			this.validation.cancel()
		}
	}

	const result = validate(value) ? true : false

	if (is_promise(result))
	{
		this.validation = result

		result.then(valid =>
		{
			if (this.validation === result)
			{
				this.validation = undefined
			}

			this.setState({ valid })
		})
	}
	else
	{
		this.setState({ valid: result })
	}
}

export function focus(options = {})
{
	if (options.preserve_validation)
	{
		this.validate()
		this.preserve_validation_on_focus = true
	}

	ReactDOM.findDOMNode(this.refs.input).focus()
}
	
export function reset_validation()
{
	this.setState({ valid: undefined })
}

export function inject(component)
{
	component.on_focus         =         on_focus.bind(component)
	component.on_blur          =          on_blur.bind(component)
	component.on_change        =        on_change.bind(component)
	component.focus            =            focus.bind(component)
	component.validate         =         validate.bind(component)
	component.reset_validation = reset_validation.bind(component)
}