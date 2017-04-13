import React, { Component, PropTypes } from 'react'
import { Title }                       from 'react-isomorphic-render'
import { connect }                     from 'react-redux'
import { flat as style }               from 'react-styling'
import { defineMessages }              from 'react-intl'

import international from '../international/internationalize'

import { menu_entries } from './layout'

import Menu from '../components/menu'

const messages = defineMessages
({
	title:
	{
		id             : 'menu',
		description    : 'Menu page header',
		defaultMessage : 'Menu'
	}
})

@international
export default class Menu_page extends Component
{
	render()
	{
		const { translate } = this.props

		const markup =
		(
			<section className="content menu-page" style={ styles.container }>
				<Title>{ translate(messages.title) }</Title>

				<h1 style={ styles.header}>
					{ translate(messages.title) }
				</h1>

				<Menu/>
			</section>
		)

		return markup
	}
}

const styles = style
`
	container
		padding: 1.6em

	header
		text-align: center
`