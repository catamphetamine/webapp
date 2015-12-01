import React, { Component } from 'react'
import hoist_statics from 'hoist-non-react-statics'
import { injectIntl } from 'react-intl'

export default function()
{
	return function(Wrapped)
	{
		Wrapped = injectIntl(Wrapped)

		class Wrapper extends Component
		{
			render()
			{
				return <Wrapped {...this.props} />
			}
		}

		return hoist_statics(Wrapper, Wrapped)
	}
}