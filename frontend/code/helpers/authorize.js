import React, { Component } from 'react'
import hoist_statics  from 'hoist-non-react-statics'

import { connect }      from 'react-redux'
import { redirect }     from 'react-isomorphic-render'
import { Preload_method_name } from 'react-isomorphic-render'

import Unauthenticated from '../pages/errors/unauthenticated'
import Unauthorized    from '../pages/errors/unauthorized'

import { add_redirect } from '../helpers/redirection'

export default function authorize(authorization)
{
	return function(Wrapped)
	{
		class Authorize extends Component
		{
			state = { error: undefined }

			componentWillMount()
			{
				this.check_privileges_and_take_action()
			}

			componentWillReceiveProps(props)
			{
				this.check_privileges_and_take_action(props)
			}

			check_privileges_and_take_action(props = this.props)
			{
				// current user
				const { user, location, redirect } = props

				// the requested page url
				const url = location.pathname + (location.search || '')

				const result = check_privileges({ user, url, authorization })

				if (result === true)
				{
					return this.setState({ error: false })
				}

				// On the server we can just perform an Http 302 Redirect
				// (for simplicity)
				if (_server_)
				{
					throw_server_side_error(user)
				}

				// On the client side: redirect to the "unauthorized" page
				// (using React-router)
				this.setState({ error: result.error })
				redirect(result.redirect_to)
			}

			render()
			{
				if (!this.state.error)
				{
					return <Wrapped {...this.props}/>
				}

				// No need to render the authentication form
				// and unauthorized message since the user
				// will be immediately redirected to those pages.
				// Just leave the page blank.
				// Otherwise that would be too much going on.
				// Simpler is considered better.

				// if (this.state.error === 'unauthenticated')
				// {
				// 	return <Unauthenticated {...this.props}/>
				// }

				// if (this.state.error === 'unauthorized')
				// {
				// 	return <Unauthorized {...this.props}/>
				// }

				return <section className="content"/>
			}
		}

		Authorize.displayName = `Authorize(${get_display_name(Wrapped)})`

		hoist_statics(Authorize, Wrapped)

		const preload = Preload_method_name

		if (Authorize[preload])
		{
			const preloader = Authorize[preload]

			Authorize[preload] = function authorize_then_preload(parameters)
			{
				const location = parameters.location

				const user = parameters.getState().authentication.user
				const url = location.pathname + location.search

				const result = check_privileges({ user, url, authorization })

				if (result.error)
				{
					// On the client side the redirection
					// will be made in `componentWillMount()`.
					// On the server side `component` won't neccessarily mount,
					// (e.g. when SSR is turned off) therefore redirect right here.

					if (_server_)
					{
						throw_server_side_error(user)
					}

					return Promise.resolve()
				}

				return preloader(parameters)
			}
		}

		return connect
		(
			state =>
			({
				user : state.authentication.user
			}),
			{ redirect }
		)
		(Authorize)
	}
}

function check_privileges({ user, url, authorization })
{
	// ensure that the user has signed id
	if (!user)
	{
		// not authenticated.
		// redirect the user to the "unauthenticated" page
		return { error: 'unauthenticated', redirect_to: add_redirect('/unauthenticated', url) }
	}

	// if no further authorization is required,
	// then show the requested page
	if (!authorization)
	{
		return true
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
			if (user.role === role)
			{
				return true
			}
		}
	}
	// if the passed parameter is a function,
	// then evaluate it
	else if (typeof authorization === 'function')
	{
		// if the authorization passes,
		// then show the page
		if (authorization(user))
		{
			return true
		}
	}

	// authorization not passed.
	// redirect the user to the "unauthorized" page
	return { error: 'unauthorized', redirect_to: add_redirect('/unauthorized', url) }
}

function get_display_name(Wrapped)
{
	return Wrapped.displayName || Wrapped.name || 'Component'
}

function throw_server_side_error(user)
{
	const error = new Error(user ? 'Unauthenticated' : 'Unauthorized')
	error.status = user ? 403 : 401
	throw error
}