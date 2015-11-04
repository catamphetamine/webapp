// require('./editor.less')

import React, { Component, PropTypes } from 'react'
import { webpage_title } from '../webpage head'
import { connect } from 'react-redux'

import styler from 'react-styling'

import { text } from '../international components'

import { defineMessages, injectIntl as international } from 'react-intl'

const messages = defineMessages
({
	header:
	{
		id             : 'home.header',
		description    : 'Home page header',
		defaultMessage : 'A dawg'
	}
})

@connect
(
	store => ({ })
)
class Page extends Component
{
	render()
	{
		const format_message = this.props.intl.formatMessage

		const husky = require('../../../assets/images/husky.jpg')

		const markup = 
		(
			<section className="content">
				{webpage_title("Home")}

				<h1 style={style.header}>
					{format_message(messages.header)}
				</h1>

				<img src={husky} style={style.image}/>
			</section>
		)

		return markup
	}
}

export default international(Page)

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