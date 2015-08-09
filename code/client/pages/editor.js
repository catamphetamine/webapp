// require('./editor.less')

import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

import styler from 'react-styling'

class Editor extends Component
{
	render()
	{
		const markup = 
		(
			<div contentEditable="true" style={style.editor}>Editor (на хоткеях + кнопки инструментов для мобильных устройств, или что-то получше)</div>
		)

		return markup
	}
}

const style = styler
`
	editor
		padding      : 0.4em

		border-color : black
		border-style : solid
		border-size  : 1px

		outline      : none
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
		return <Editor {...this.props}/>
	}
}