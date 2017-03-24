import React, { Component, PropTypes }    from 'react'
import { Title, preload, redirect, Link } from 'react-isomorphic-render'
import { connect }                        from 'react-redux'
import styler                             from 'react-styling'
import classNames                         from 'classnames'
import { defineMessages, FormattedMessage } from 'react-intl'
import Redux_form, { Field } from 'simpler-redux-form'
import { Form } from 'react-responsive-ui'

import
{
	get_block_poster_token,
	block_poster
}
from '../../redux/poster/block'

import { snack } from '../../redux/snackbar'

import Submit     from '../../components/form/submit'
import Text_input from '../../components/form/text input'
import Poster     from '../../components/poster'

import international from '../../international/internationalize'

@Redux_form
@preload(({ dispatch, getState, location, parameters }) =>
{
	return dispatch(get_block_poster_token(parameters.poster_id, parameters.token_id))
})
@connect
(
	state =>
	({
		current_user : state.authentication.user,
		block_poster_token : state.block_poster.token
	}),
	{
		block_poster,
		snack,
		redirect
	}
)
@international
export default class Block_poster extends Component
{
	constructor()
	{
		super()

		this.submit = this.submit.bind(this)
	}

	validate_reason = (value) =>
	{
		const { translate } = this.props

		if (!value)
		{
			return translate(messages.reason_required)
		}
	}

	async submit(values)
	{
		try
		{
			const
			{
				block_poster_token,
				params,
				block_poster,
				snack,
				redirect,
				translate
			}
			= this.props

			const poster = block_poster_token.poster

			const token_id = params.token_id

			await block_poster(poster.id, token_id, values.reason)

			snack(translate(messages.user_blocked))

			// If it was a self block then the user has been signed out
			if (block_poster_token.self)
			{
				window.location = Poster.url(poster)
			}
			else
			{
				redirect(Poster.url(poster))
			}
		}
		catch (error)
		{
			console.error(error)
		}
	}

	render()
	{
		const
		{
			current_user,
			block_poster_token,
			submit,
			translate
		}
		= this.props

		const poster = block_poster_token.poster
		const self = block_poster_token.self

		const markup =
		(
			<div className="content">
				<section
					className="content-section">

					{/* "Block user" */}
					<Title>{ translate(self ? messages.header_self : messages.header) }</Title>

					<Form
						submit={ submit(this.submit) }
						className="compact">

						{/* "Blocking user ..." */}
						<FormattedMessage
							{ ...(self ? messages.blocking_self : messages.blocking_user) }
							values={ self ? undefined : { name: <Poster>{ poster }</Poster> } }
							tagName="p"/>

						{/* "Reason" */}
						{ !self &&
							<Text_input
								name="reason"
								label={ translate(messages.reason) }
								validate={ this.validate_reason }/>
						}

						<Form.Actions>
							{/* "Submit" */}
							<Submit
								className="button--primary">
								{ translate(messages.submit) }
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
	blocking_poster:
	{
		id             : `user.block.blocking_poster`,
		description    : `Description of which user is gonna be blocked`,
		defaultMessage : `Blocking {name}`
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