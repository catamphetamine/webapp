import React, { Component, PropTypes } from 'react'
import { title } from 'react-isomorphic-render'
import { connect } from 'react-redux'

import { Link } from 'react-router'
import styler from 'react-styling'

import { redirect } from 'react-isomorphic-render'

@connect()
export default class Page extends Component
{
	componentDidMount()
	{
		// redirect to "/showcase/form" from "/showcase"
		if (this.props.location.pathname === '/showcase')
		{
			this.props.dispatch(redirect(this.props.location.pathname + '/form'))
		}
	}

	render()
	{
		const markup = 
		(
			<section className="content">
				{title("UI Showcase")}

				<ul style={style.menu}>
					<li style={style.menu.item}><Link to="/showcase/dialog" style={style.menu.item.link} activeStyle={style.menu.item.link.current}>{'Dialog'}</Link></li>
					<li style={style.menu.item}><Link to="/showcase/form" style={style.menu.item.link} activeStyle={style.menu.item.link.current}>{'Form'}</Link></li>
				</ul>
				
        		{this.props.children}

				<div style={{ marginTop: '3em' }}>Ещё какие-то компоненты из интернета:</div>

				<ul>
					<li><a href="http://www.material-ui.com/">Material UI</a></li>
					<li><a href="http://www.materializecss.com/">Materialize CSS</a></li>
					<li><a href="http://victory.formidable.com/">Victory for D3</a></li>
					<li><a href="https://github.com/gaearon/react-dnd">React D'n'D</a></li>
					<li><a href="https://github.com/felixrieseberg/React-Dropzone-Component">File drop zone</a></li>
					<li><a href="https://github.com/AnSavvides/d3act">D3 + React</a></li>
					<li><a href="http://blog.siftscience.com/blog/2015/4/6/d-threeact-how-sift-science-made-d3-react-besties">Ещё что-то про графики D3</a></li>
					<li><a href="http://balloob.github.io/react-sidebar/example/">Sidebar</a></li>
					<li><a href="http://labs.voronianski.com/react-soundplayer/">Sound Player</a></li>
				</ul>
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