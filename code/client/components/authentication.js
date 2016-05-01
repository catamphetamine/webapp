import React, { Component, PropTypes } from 'react'
// import ReactDOM from 'react-dom'
import { PropTypes as React_router_prop_types, Link } from 'react-router'

import { connect } from 'react-redux'
import styler      from 'react-styling'

import { defineMessages } from 'react-intl'
import international from '../international/internationalize'

import Text_input          from './text input'
import Checkbox            from './checkbox'
import Button              from './button'
import Form                from './form'
import Modal               from './modal'
import Authentication_form from './authentication form'
import User_picture        from './user picture'

import { bindActionCreators as bind_action_creators } from 'redux'

import { sign_out } from '../actions/authentication'

export const messages = defineMessages
({
	sign_in:
	{
		id             : 'authentication.sign_in',
		description    : 'Log in action',
		defaultMessage : 'Sign in'
	},
	sign_out:
	{
		id             : 'authentication.sign_out',
		description    : 'Log out action',
		defaultMessage : 'Sign out'
	},
	register:
	{
		id             : 'authentication.register',
		description    : 'Registration action',
		defaultMessage : 'Register'
	}
})

@connect
(
	model => 
	({
		user           : model.authentication.user,
		sign_out_error : model.authentication.sign_out_error
	}),
	dispatch =>
	{
		const props = bind_action_creators
		({
			sign_out
		},
		dispatch)

		props.dispatch = dispatch

		return props
	}
)
@international()
export default class Authentication extends Component
{
	state = 
	{
		show : false
	}

	pristine_form_state = 
	{
		register : false
	}

	static propTypes =
	{
		user           : PropTypes.object,
		sign_out_error : PropTypes.object,
		sign_out       : PropTypes.func.isRequired
	}

	constructor(properties)
	{
		super(properties)

		extend(this.state, this.pristine_form_state)
	}

	componentWillReceiveProps(props)
	{
		// hide modal after user signed in
		if (props.user && !this.props.user)
		{
			this.hide()
		}
	}

	render()
	{
		const { user, translate } = this.props

		const markup =
		(
			<div className="authentication" style={this.props.style}>
				
				{/* Sign in action */}
				{ !user && <Button className="sign-in" link="/sign-in" action={::this.show}>{this.translate(messages.sign_in)}</Button> }

				{/* User info if authenticated */}
				{ user && this.render_user_info(user) }

				<Modal
					isOpen={exists(this.state.password) || (!user && this.state.show)}
					onRequestClose={::this.hide}>

					<Authentication_form/>
				</Modal>
			</div>
		)

		return markup
	}

	render_user_info(user)
	{
		const markup = 
		(
			<div className="user-info">
				{/* Username */}
				{/* <a href="/"></a> */}
				<Link to={`/user/${user.id}`} className="user-name">{user.name}</Link>

				{/* Sign out action */}
				<Form className="sign-out-form" post="/authentication/legacy/sign-out">
					<Button className="sign-out" submit={true} action={::this.sign_out}>{this.translate(messages.sign_out)}</Button>
				</Form>

				{/* Avatar */}
				{/*<div className="user-picture" style={{ backgroundImage: `url("${user_picture}")` }}></div>*/}
				{/* the wrapping <div/> keeps image aspect ratio */}
				{/* <div className="user-picture" onClick={::this.change_user_picture}>
					<img src={user_picture}/>
				</div>*/}

				{/* The picture itself */}
				<User_picture
					className="user-picture--header"
					user={user}/>
			</div>
		)

		return markup
	}

	translate(message)
	{
		return this.props.translate(message)
	}

	change_user_picture()
	{
		alert('to do')
	}

	show()
	{
		this.setState({ show: true }, () =>
		{
			// this.refs.authentication_form.focus()
		})
	}

	hide()
	{
		this.setState({ show: false, ...this.pristine_form_state })
	}

	async sign_out()
	{
		try
		{
			await this.props.sign_out()

			// redirect to the main page (unnecessary)
			// this.props.dispatch(redirect('/'))
		}
		catch (error)
		{
			// swallows http errors
			if (!error.status)
			{
				throw error
			}
		}
	}
}

const style = styler
`
`