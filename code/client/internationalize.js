import React, { Component } from 'react'
import hoist_statics from 'hoist-non-react-statics'
import { injectIntl as international } from 'react-intl'

/*
  Note:
    When this decorator is used, it MUST be the first (outermost) decorator.
    Otherwise, we cannot find and call the preload and preload_deferred methods.
*/

export default function()
{
	return function(Wrapped)
	{
		Wrapped = international(Wrapped)

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