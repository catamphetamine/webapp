import React, { Component } from 'react'
import hoist_statics  from 'hoist-non-react-statics'

import { connect }      from 'react-redux'
import { replaceState } from 'redux-router'

import Unauthenticated from './pages/errors/unauthenticated'

export default function(authorization)
{
	return function(Wrapped)
	{
		class Wrapper extends Component
		{
			state = { show: false }

			componentWillMount()
			{
				this.check_privileges()
			}

			componentWillReceiveProps(props)
			{
				this.check_privileges()
			}

			check_privileges()
			{
				// the requested page url
				const url = this.props.location.pathname + (this.props.location.search ? '?' + this.props.location.search : '')

				// ensure that the user has signed id
				if (!this.props.user)
				{
					// "unauthenticated" page url
					const redirect_to = `/unauthenticated?request=${url}`

					// on the server we can just perform an Http 302 Redirect
					// (for simplicity)
					if (_server_)
					{
						const error = new Error('Unauthenticated')
						error.redirect_to = redirect_to
						throw error
					}

					// on the client side: redirect to the "unauthenticated" page
					// (using React-router)
					return this.props.dispatch(replaceState(null, redirect_to))
				}

				// if no further authorization is required,
				// then show the requested page
				if (!authorization)
				{
					return this.setState({ show: true })
				}

				if (typeof authorization === 'string')
				{
					authorization = [authorization]
				}

				// if the passed parameter is a list of roles,
				// at least one of which is required to view the page
				if (Array.isArray(authorization))
				{
					// if the user has one of the required roles,
					// then show the page
					for (let role of authorization)
					{
						if (this.props.user.role === role)
						{
							return this.setState({ show: true })
						}
					}
				}
				// if the passed parameter is a function,
				// then evaluate it
				else if (typeof authorization === 'function')
				{
					// if the authorization passes,
					// then show the page
					if (authorization(this.props.user))
					{
						return this.setState({ show: true })
					}
				}

				// authorization not passed.
				// redirect the user to the "unauthorized" page

				const redirect_to = `/unauthorized?request=${url}`

				// on the server we can just perform an Http 302 Redirect
				// (for simplicity)
				if (_server_)
				{
					const error = new Error('Unauthorized')
					error.redirect_to = redirect_to
					throw error
				}

				// on the client side: redirect to the "unauthorized" page
				// (using React-router)
				return this.props.dispatch(replaceState(null, redirect_to))
			}

			render()
			{
				return this.state.show ? <Wrapped {...this.props}/> : null
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