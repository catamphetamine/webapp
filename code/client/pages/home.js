import React, { Component, PropTypes } from 'react'
import { title }                       from 'react-isomorphic-render'
import { connect }                     from 'react-redux'
import styler                          from 'react-styling'
import { defineMessages }              from 'react-intl'

import international from '../international/internationalize'

import { messages as layout_messages } from './layout'

const messages = defineMessages
({
	header:
	{
		id             : 'home.header',
		description    : 'Home page header',
		defaultMessage : 'A dawg'
	}
})

@international()
export default class Home extends Component
{
	render()
	{
		const husky = require('../../../assets/images/husky.jpg')

		const markup = 
		(
			<section className="content" style={style.content}>
				{title(this.props.translate(layout_messages.title))}

				<h1 style={style.header}>
					{this.props.translate(messages.header)}
				</h1>

				<img src={husky} style={style.image}/>
			</section>
		)

		return markup
	}
}

const style = styler
`
	content
		padding: 1em

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