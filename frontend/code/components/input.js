import React, { Component, PropTypes } from 'react'
import ReactDOM      from 'react-dom'
import hoist_statics from 'hoist-non-react-statics'

export default function()
{
	return function(Wrapped)
	{
		// this component has no `this.intl` instance variable
		class Input extends Component
		{
			static propTypes =
			{
				on_change : PropTypes.func
			}

			constructor(props, context)
			{
				super(props, context)

				this.on_change = this.on_change.bind(this)
			}

			render()
			{
				return <Wrapped ref="input" {...this.props} on_change={this.on_change}/>
			}

			focus()
			{
				ReactDOM.findDOMNode(this.refs.input.refs.input).focus()
			}

			on_change(value)
			{
				// If it's an event then extract the input value from it
				if (typeof value.preventDefault === 'function')
				{
					// the `value` is trimmed by now which is handy
					value = value.target.value
				}

				// // Check if the input value has actually changed
				// if (this.props.value === value)
				// {
				// 	console.log('on change the same:', value)
				// 	return // input value actually didn't change
				// }

				// Input value changed, call the method
				// which was passed as a property (on_change={...})
				if (this.props.on_change)
				{
					this.props.on_change(value)
				}
			}
		}

		Input.displayName = `Input(${get_display_name(Wrapped)})`

		return hoist_statics(Input, Wrapped)
	}
}

function get_display_name(Wrapped)
{
	return Wrapped.displayName || Wrapped.name || 'Component'
}