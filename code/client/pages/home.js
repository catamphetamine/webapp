// require('./editor.less')

import React, { Component, PropTypes } from 'react'
import { webpage_title } from '../webpage head'
import { connect } from 'react-redux'

import styler from 'react-styling'

import { FormattedMessage } from '../international components'

@connect
(
	store => ({ })
)
export default class Page extends Component
{
	render()
	{
		const husky = require('../../../assets/images/husky.jpg')

		const markup = 
		(
			<section>
				{webpage_title("Home")}

				<h1 style={style.header}>
					<FormattedMessage message="home.welcome" />
				</h1>
				<div style={style.image_container}><img src={husky}/></div>
			</section>
		)

		return markup
	}
}

const style = styler
`
	header
		text-align: center

	image_container
		text-align: center
`