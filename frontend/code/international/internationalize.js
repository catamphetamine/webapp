import React, { Component } from 'react'
import hoist_statics        from 'hoist-non-react-statics'
import { injectIntl }       from 'react-intl'

export default function(Wrapped)
{
	// this component has no `this.intl` instance variable
	class _International extends Component
	{
		render()
		{
			return <Wrapped { ...this.props } translate={ this.props.intl.formatMessage }/>
		}
	}

	// `this.intl` will be available for this component
	const International = injectIntl(_International)

	International.displayName = `International(${get_display_name(Wrapped)})`

	return hoist_statics(International, Wrapped)
}

function get_display_name(Wrapped)
{
	return Wrapped.displayName || Wrapped.name || 'Component'
}