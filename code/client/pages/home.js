// require('./editor.less')

import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

import styler from 'react-styling'

class Page extends Component
{
	render()
	{
		const husky = require('../../../client/images/husky.jpg')

		const markup = 
		(
			<section>
				<h1 style={style.header}>Home page</h1>
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
		return <Page {...this.props}/>
	}
}