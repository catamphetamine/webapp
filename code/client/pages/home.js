// require('./editor.less')

import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

import styler from 'react-styling'

// import assets from '../assets'
// const husky = assets.require_image('./images/kitten.jpg')

import { require_server_image } from '../../server/webpack'
const husky = _client_ ? require('../../../client/images/husky.jpg') : require_server_image('../../../client/images/husky.jpg')

class Page extends Component
{
	render()
	{
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