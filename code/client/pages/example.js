import React, { Component, PropTypes } from 'react'

import { title, redirect }   from 'react-isomorphic-render'
import { connect }           from 'react-redux'
import { Link }              from 'react-router'
import styler                from 'react-styling'

@connect()
export default class Page extends Component
{
	componentDidMount()
	{
		// redirect to "/example/simple" from "/example"
		if (this.props.location.pathname === '/example')
		{
			this.props.dispatch(redirect(this.props.location.pathname + '/simple'))
		}
	}

	render()
	{
		const markup = 
		(
			<section className="content">
				{title("REST API Example")}

				<ul style={style.menu}>
					<li style={style.menu.item}><Link to="/example/simple" style={style.menu.item.link} activeStyle={style.menu.item.link.current}>{'Simple'}</Link></li>
					<li style={style.menu.item}><Link to="/example/database" style={style.menu.item.link} activeStyle={style.menu.item.link.current}>{'Database'}</Link></li>
					<li style={style.menu.item}><Link to="/example/graphql" style={style.menu.item.link} activeStyle={style.menu.item.link.current}>{'GraphQL'}</Link></li>
				</ul>
				
        		{this.props.children}
			</section>
		)

		return markup
	}
}

const style = styler
`
	menu
		list-style-type : none
		padding : 0
		margin-top: 0

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