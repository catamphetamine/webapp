import React, { Component, PropTypes } from 'react'
import { webpage_title } from '../webpage head'
import { connect } from 'react-redux'

import { Link } from 'react-router'
import styler from 'react-styling'

@connect
(
	store => ({ })
)
export default class Page extends Component
{
	render()
	{
		const markup = 
		(
			<section>
				{webpage_title("REST API Example")}

				<header>
					<ul style={style.menu}>
						<li style={style.menu.item}><Link to="/example/simple" style={style.menu.item.link} activeStyle={style.menu.item.link.current}>{'Simple'}</Link></li>
						<li style={style.menu.item}><Link to="/example/database" style={style.menu.item.link} activeStyle={style.menu.item.link.current}>{'Database'}</Link></li>
						<li style={style.menu.item}><Link to="/example/graphql" style={style.menu.item.link} activeStyle={style.menu.item.link.current}>{'GraphQL'}</Link></li>
					</ul>
				</header>
				
        		{this.props.children}
			</section>
		)

		return markup
	}
}

const style = styler
`
	menu
		list-style-type: none

		item
			display: inline-block

			link
				display         : inline-block
				text-decoration : none
				color           : #000000

				padding-left    : 0.4em
				padding-right   : 0.4em
				padding-top     : 0.2em
				padding-bottom  : 0.2em

				&current
					color            : #ffffff
					background-color : #73C9FF
`