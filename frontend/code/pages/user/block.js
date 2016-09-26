import React, { Component, PropTypes } from 'react'
import { title }                       from 'react-isomorphic-render'
import { preload }                     from 'react-isomorphic-render/redux'
import { connect }                     from 'react-redux'
import styler                          from 'react-styling'
import { Link }                        from 'react-router'
import classNames                      from 'classnames'

import { defineMessages, FormattedMessage } from 'react-intl'

import { bindActionCreators as bind_action_creators } from 'redux'

import Redux_form, { Field, Submit } from 'simpler-redux-form'

import
{
	get_blocked_user,
	block_user
}
from '../../actions/user/block'

import Button       from '../../components/button'
import Text_input   from '../../components/text input'

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
	submit:
	{
		id             : `user.block.submit`,
		description    : `Block user page submit button text`,
		defaultMessage : `Block`
	}
})

@Redux_form({ id: 'block_user' })
@preload(({ dispatch, get_state, location, parameters }) =>
{
	return dispatch(get_blocked_user(parameters.id))
})
@connect
(
	model =>
	({
		current_user : model.authentication.user,

		user : model.block_user.user
	}),
	dispatch =>
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
	static propTypes =
	{
		current_user : PropTypes.object.isRequired,
		user         : PropTypes.object
	}

	constructor(props, context)
	{
		super(props, context)
	}

	render()
	{
		const { current_user, user, translate } = this.props

		const self = current_user.id === user.id

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
						values={{ name: <Link to={`/user/${user.alias || user.id}`}>{user.name}</Link> }}
						tagName="p"/>

					{/* "Reason" */}
					{ !self &&
						<Field
							component={Text_input}
							name="reason"
							label={translate(messages.reason)}/>
					}

					{/* "Submit" */}
					<Submit
						component={Button}
						style={styles.submit}>
						{translate(messages.submit)}
					</Submit>
				</section>
			</div>
		)

		return markup
	}
}

const styles = styler
`
	submit
		margin-top: 1em
`