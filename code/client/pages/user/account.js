import React, { Component, PropTypes } from 'react'
import { title }                       from 'react-isomorphic-render'
import { connect }                     from 'react-redux'
import styler                          from 'react-styling'
import { defineMessages }              from 'react-intl'

import international from '../../international/internationalize'

const messages = defineMessages
({
	header:
	{
		id             : 'user.account.header',
		description    : 'User account page header',
		defaultMessage : 'Account'
	}
})

@connect
(
	model =>
	({
		user : model.authentication.user
	})
)
@international()
export default class Account_page extends Component
{
	render()
	{
		const markup = 
		(
			<section className="content">
				{title(this.props.translate(messages.header))}

				<h1 style={style.header}>
					{this.props.translate(messages.header)}
				</h1>
			</section>
		)

		return markup
	}
}

const style = styler
`
	header
		text-align: center
`