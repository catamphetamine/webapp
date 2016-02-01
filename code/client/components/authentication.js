import React, { Component, PropTypes } from 'react'
// import ReactDOM from 'react-dom'
import { PropTypes as React_router_prop_types } from 'react-router'

import { connect } from 'react-redux'
import styler      from 'react-styling'

import { pushState } from 'redux-router'

import { defineMessages } from 'react-intl'
import international from '../internationalize'

import Uri from '../tools/uri'

import Text_input          from './text input'
import Checkbox            from './checkbox'
import Button              from './button'
import Form                from './form'
import Modal               from './modal'
import Authentication_form from './authentication form'

import { bindActionCreators as bind_action_creators } from 'redux'

import { sign_out } from '../actions/authentication'

const messages = defineMessages
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
		const result = bind_action_creators
		({
			sign_out
		},
		dispatch)

		result.dispatch = dispatch

		return result
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
		const translate = this.props.intl.formatMessage

		const { user } = this.props

		const markup =
		(
			<div className="authentication" style={ this.props.style ? extend({ display: 'inline-block' }, this.props.style) : { display: 'inline-block' } }>
				
				{/* Sign in action */}
				{ !user ? <Button className="sign-in" action={::this.show}>{this.translate(messages.sign_in)}</Button> : null }

				{/* User info if authenticated */}
				{ user ? this.render_user_info(user) : null }

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
		const user_picture = user.picture ? `/upload/user_pictures/${user.id}.jpg` : require('../../../assets/images/no user picture.png')

		const markup = 
		(
			<div className="user-info">
				{/* Username */}
				{/* <a href="/"></a> */}
				<div className="user-name">{user.name}</div>

				{/* Sign out action */}
				<Button className="sign-out" action={::this.sign_out}>{this.translate(messages.sign_out)}</Button>

				{/* Avatar */}
				{/*<div className="user-picture" style={{ backgroundImage: `url("${user_picture}")` }}></div>*/}
				{/* the wrapping <div/> keeps image aspect ratio */}
				{/* <div className="user-picture" onClick={::this.change_user_picture}>
					<img src={user_picture}/>
				</div>*/}
				<img className="user-picture" src={user_picture}/>
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
			// this.props.dispatch(pushState(null, '/'))
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