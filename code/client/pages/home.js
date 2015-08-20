// require('./editor.less')

import React, { Component, PropTypes } from 'react'
import DocumentMeta from 'react-document-meta'
import { connect } from 'react-redux'

import styler from 'react-styling'

import { FormattedMessage } from '../international components'

import Locale_switcher from '../components/locale switcher'

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