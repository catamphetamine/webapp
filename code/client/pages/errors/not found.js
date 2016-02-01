import React, { Component } from 'react'
import { title }            from 'react-isomorphic-render'
import { connect }          from 'react-redux'

import styler from 'react-styling'

import { defineMessages } from 'react-intl'
import international      from '../../internationalize'

const messages = defineMessages
({
	header:
	{
		id             : 'not_found.header',
		description    : 'Not found page header',
		defaultMessage : 'Page not found'
	}
})

@connect
(
	store => ({ })
)
@international()
export default class Page extends Component
{
	render()
	{
		const markup =
		(
			<section className="content">
				{title("Page not found")}

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