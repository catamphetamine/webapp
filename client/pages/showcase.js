// require('./about.less' )

import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

import { Link } from 'react-router'
import styler from 'react-styling'

class Showcase extends Component
{
	render()
	{
		const markup = 
		(
			<div>
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

@connect(store =>
({
	// settings: store.settings.data
}))
export default class Reduxed
{
	static propTypes =
	{
		// settings: PropTypes.object,
		dispatch: PropTypes.func.isRequired
	}

	// static preload(store)
	// {
	// 	const promises = []
	// 	// if (!are_settings_loaded(store.getState()))
	// 	// {
	// 		promises.push(store.dispatch(actions.get_settings()))
	// 	// }
	// 	return Promise.all(promises)
	// }

	render()
	{
		const { dispatch } = this.props
		return <Showcase {...this.props}/>
	}
}