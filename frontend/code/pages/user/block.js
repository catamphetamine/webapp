import React, { Component, PropTypes }    from 'react'
import { title, preload, redirect, Link } from 'react-isomorphic-render'
import { connect }                        from 'react-redux'
import styler                             from 'react-styling'
import classNames                         from 'classnames'

import { defineMessages, FormattedMessage } from 'react-intl'

import { bindActionCreators as bind_action_creators } from 'redux'

import Redux_form, { Field } from 'simpler-redux-form'

import
{
	get_block_user_token,
	block_user
}
from '../../redux/user/block'

import { Form } from 'react-responsive-ui'

import Submit                 from '../../components/form/submit'
import Text_input             from '../../components/form/text input'
import User                   from '../../components/user'

import international from '../../international/internationalize'

const messages = defineMessages
({
	header:
	{
		id             : `user.block.header`,
		description    : `Block user page header`,
		defaultMessage : `Block user`
	},
	header_self:
	{
		id             : `user.block.header_self`,
		description    : `Block user page header when blocking self`,
		defaultMessage : `Block my account`
	},
	blocking_user:
	{
		id             : `user.block.blocking_user`,
		description    : `Description of which user is gonna be blocked`,
		defaultMessage : `Blocking user {name}`
	},
	blocking_self:
	{
		id             : `user.block.blocking_self`,
		description    : `Description asking if the user is sure about temporarily blocking his own account`,
		defaultMessage : `Are you sure you want to temporarily block your account?`
	},
	reason:
	{
		id             : `user.block.reason`,
		description    : `A title of a text input with description of the reason why the user is being blocked`,
		defaultMessage : `Reason`
	},
	reason_required:
	{
		id             : `user.block.reason.required`,
		description    : `A hint that blocking reason is required`,
		defaultMessage : `Specify a reason for blocking this user`
	},
	submit:
	{
		id             : `user.block.submit`,
		description    : `Block user page submit button text`,
		defaultMessage : `Block`
	},
	user_blocked:
	{
		id             : `user.block.done`,
		description    : `An info message confirming the user has been blocked`,
		defaultMessage : `User has been blocked`
	}
})

@Redux_form
@preload(({ dispatch, getState, location, parameters }) =>
{
	return dispatch(get_block_user_token(parameters.token_id))
})
@connect
(
	state =>
	({
		current_user : state.authentication.user,
		block_user_token : state.block_user.token
	}),
	(dispatch) =>
	({
		dispatch,
		...bind_action_creators
		({
			block_user
		},
		dispatch)
	})
)
@international()
export default class User_profile extends Component
{
	constructor()
	{
		super()

		this.validate_reason = this.validate_reason.bind(this)
		this.submit          = this.submit.bind(this)
	}

	validate_reason(value)
	{
		const { translate } = this.props

		if (!value)
		{
			return translate(messages.reason_required)
		}
	}

	async submit(values)
	{
		const { block_user_token, params, block_user, dispatch, translate } = this.props

		const user = block_user_token.user

		const token_id = params.token_id

		await block_user(user.id, token_id, values.reason)

		dispatch({ type: 'snack', snack: translate(messages.user_blocked) })

		dispatch(redirect(User.url(user)))
	}

	render()
	{
		const { current_user, block_user_token, submit, translate } = this.props

		const user = block_user_token.user

		const self = block_user_token.self

		const markup =
		(
			<div className="content">
				<section
					className="content-section">

					{/* "Block user" */}
					{title(translate(self ? messages.header_self : messages.header))}

					{/* "Blocking user ..." */}
					<FormattedMessage
						{...(self ? messages.blocking_self : messages.blocking_user)}
						values={{ name: <User>{user}</User> }}
						tagName="p"/>

					<Form
						action={submit(this.submit)}>

						{/* "Reason" */}
						{ !self &&
							<Text_input
								name="reason"
								label={translate(messages.reason)}
								validate={this.validate_reason}/>
						}

						<Form.Actions>
							{/* "Submit" */}
							<Submit>
								{translate(messages.submit)}
							</Submit>
						</Form.Actions>
					</Form>
				</section>
			</div>
		)

		return markup
	}
}

const styles = styler
`
`