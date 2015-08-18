// require('./about.less' )

import React, { Component, PropTypes } from 'react'
import DocumentMeta from 'react-document-meta'
import { connect } from 'react-redux'

import { Link } from 'react-router'
import styler from 'react-styling'

@connect
(
	store => ({ })
)
export default class Showcase extends Component
{
	render()
	{
		const markup = 
		(
			<div>
				<DocumentMeta title="UI Showcase"/>

				<header>
					<ul style={style.menu}>
						<li style={style.menu.item}><Link to="/showcase/dialog" style={style.menu.item.link} activeStyle={style.menu.item.link.current}>{'Dialog'}</Link></li>
						<li style={style.menu.item}><Link to="/showcase/form" style={style.menu.item.link} activeStyle={style.menu.item.link.current}>{'Form'}</Link></li>
					</ul>
				</header>

				Ещё какие-то компонтенты из интернета:

				<ul>
					<li><a href="https://github.com/felixrieseberg/React-Dropzone-Component">File drop zone</a></li>
					<li><a href="http://blog.siftscience.com/blog/2015/4/6/d-threeact-how-sift-science-made-d3-react-besties">Графики D3</a></li>
					<li><a href="http://balloob.github.io/react-sidebar/example/">Sidebar</a></li>
					<li><a href="http://labs.voronianski.com/react-soundplayer/">Sound Player</a></li>
				</ul>
				
        		{this.props.children}
			</div>
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
					background-color : #000000
`