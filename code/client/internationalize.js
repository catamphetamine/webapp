import React, { Component } from 'react'
import hoist_statics from 'hoist-non-react-statics'
import { injectIntl } from 'react-intl'

export default function()
{
	return function(Wrapped)
	{
		Wrapped = injectIntl(Wrapped)

		class International extends Component
		{
			render()
			{
				return <Wrapped {...this.props} translate={function(message) { return this.intl.formatMessage(message) }} />
			}
		}

		International.displayName = `International(${get_display_name(Wrapped)})`

		return hoist_statics(International, Wrapped)
	}
}

function get_display_name(Wrapped)
{
	return Wrapped.displayName || Wrapped.name || 'Component'
}