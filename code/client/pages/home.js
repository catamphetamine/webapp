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
		defaultMessage : 'A dog'
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
			<section>
				{webpage_title("Home")}

				<h1 style={style.header}>
					{format_message(messages.header)}
				</h1>

				<div style={style.image_container}><img src={husky}/></div>
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

	image_container
		text-align: center
`