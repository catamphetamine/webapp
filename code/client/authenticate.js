import React, { Component } from 'react'
import hoist_statics  from 'hoist-non-react-statics'

import { connect }      from 'react-redux'
import { replaceState } from 'redux-router'

import Unauthenticated from './pages/errors/unauthenticated'

export default function()
{
	return function(Wrapped)
	{
		class Wrapper extends Component
		{
			componentWillMount()
			{
				this.check_authentication()
			}

			componentWillReceiveProps(props)
			{
				this.check_authentication()
			}

			check_authentication()
			{
				if (!this.props.user)
				{
					const url = this.props.location.pathname + (this.props.location.search ? '?' + this.props.location.search : '')
					const redirect_to = `/unauthenticated?request=${url}`

					if (_server_)
					{
						const error = new Error('Unauthenticated')
						error.redirect_to = redirect_to
						throw error
					}

					this.props.dispatch(replaceState(null, redirect_to))
				}
			}

			render()
			{
				return this.props.user ? <Wrapped {...this.props}/> : <Unauthenticated/>
			}
		}

		Wrapper = hoist_statics(Wrapper, Wrapped)
	
		return connect
		(model =>
		({
			user : model.authentication.user
		}))
		(Wrapper)
	}
}