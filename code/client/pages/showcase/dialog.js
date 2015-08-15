import React, { Component } from 'react'
// import Boron from 'boron'
import styler from 'react-styling'

import { connect } from 'react-redux'

const style = styler
`
	button
		margin      : 1em auto
		padding     : 1em 2em
		outline     : none
		font-size   : 16
		font-weight : 600
		background  : #C94E50
		color       : #FFFFFF
		border      : none

	container
		padding    : 2em
		text-align : center
`

@connect
(
	store => ({ })
)
export default class Dialog extends Component
{
	render()
	{
		const markup = 
		(
			<div style={style.container}>
				<a href="https://github.com/yuanyan/boron/issues/8">https://github.com/yuanyan/boron/issues/8</a>
				{/*['OutlineModal', 'ScaleModal', 'FadeModal', 'FlyModal', 'DropModal', 'WaveModal'].map(name => this.markup_for_button_and_dialog(name))*/}
			</div>
		)

		return markup
	}

	toggle_dialog(dialog)
	{
		return () => this.refs[dialog].toggle()
	}

	markup_for_button_and_dialog(dialog)
	{
		const Modal = Boron[dialog]

		const content = 
		(
			<div style={style.container}>
				<h2 style={{ margin: 0, color: '#C94E50', 'font-weight': 400 }}>
					http://madscript.com/boron/
				</h2>
				<button style={style.button} onClick={this.toggle_dialog(dialog)}>Close</button>
			</div>
		)

		const markup =
		(
			<div>
				<button style={style.button} onClick={this.toggle_dialog(dialog)}>Open {dialog}</button>

				<Modal ref={dialog}>{content}</Modal>
			</div>
		)

		return markup
	}
}