// require('./editor.less')

import React, { Component, PropTypes } from 'react'
import { title }                       from 'react-isomorphic-render'
import { connect }                     from 'react-redux'
import styler                          from 'react-styling'
import { defineMessages }              from 'react-intl'

import international from '../internationalize'

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
@international()
export default class Page extends Component
{
	render()
	{
		const translate = this.props.intl.formatMessage

		const husky = require('../../../assets/images/husky.jpg')

		const markup = 
		(
			<section className="content">
				{title("Home")}

				<h1 style={style.header}>
					{translate(messages.header)}
				</h1>

				<img src={husky} style={style.image}/>
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