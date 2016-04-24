import React, { Component, PropTypes } from 'react'
import { title }                       from 'react-isomorphic-render'
import { connect }                     from 'react-redux'
import styler                          from 'react-styling'
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

@international()
export default class Menu_page extends Component
{
	render()
	{
		const { translate } = this.props

		const markup = 
		(
			<section className="content menu-page" style={{ padding: '1.6em' }}>
				{title(translate(messages.title))}

				<h1 style={style.header}>
					{translate(messages.title)}
				</h1>

				<Menu items={menu_entries(translate)} style={style.menu}/>
			</section>
		)

		return markup
	}
}

const style = styler
`
	header
		text-align: center

	menu
		display: block !important
		z-index: 1
`