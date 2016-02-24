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
		id             : 'user.profile.header',
		description    : 'User profile page header',
		defaultMessage : 'Profile'
	}
})

@connect
(
	model => ({ })
)
@international()
export default class Page extends Component
{
	render()
	{
		const husky = require('../../../../assets/images/husky.jpg')

		const markup = 
		(
			<section className="content">
				{title("User name here")}

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

	image
		display: block

		margin-left  : auto
		margin-right : auto

		border-width : 1px
		border-style : solid
		border-color : #7f7f7f

		border-radius : 0.5em
`