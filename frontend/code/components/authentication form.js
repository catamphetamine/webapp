import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

import Register from './authentication form/register'
import Sign_in from './authentication form/sign in'
import Sign_in_with_access_code from './authentication form/sign in with access code'

import
{
	connector,
	reset_authentication
}
from '../redux/authentication'

@connect
(
	state =>
	({
		...connector(state.authentication)
	}),
	{
		reset_authentication
	}
)
export default class Authentication_form extends Component
{
	state = {}

	constructor()
	{
		super()

		this.start_registration = this.start_registration.bind(this)
		this.signed_in          = this.signed_in.bind(this)
	}

	start_registration(email)
	{
		this.setState({ register: true, email })
	}

	signed_in()
	{
		const { close } = this.props

		if (close)
		{
			close()
		}
	}

	componentWillUnmount()
	{
		const { reset_authentication } = this.props

		reset_authentication()
	}

	render()
	{
		const
		{
			access_code_id
		}
		= this.props

		const { email } = this.state

		const
		{
			register
		}
		= this.state

		if (access_code_id)
		{
			return <Sign_in_with_access_code signed_in={ this.signed_in }/>
		}

		if (register)
		{
			return <Register email={ email }/>
		}

		return <Sign_in start_registration={ this.start_registration }/>
	}
}