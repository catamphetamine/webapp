import React, { Component } from 'react'
import { title }            from 'react-isomorphic-render'
import styler               from 'react-styling'
import { connect }          from 'react-redux'

import Modal from '../../components/modal'

export default class Dialog extends Component
{
	state =
	{
		show_dialog: false
	};

	render()
	{
		const markup = 
		(
			<div>
				{title("Dialog Showcase")}

				<div style={style.container}>
					<a href="https://github.com/rackt/react-modal">https://github.com/rackt/react-modal</a>

					<br/>
					<br/>

					<button style={style.button} onClick={::this.toggle_dialog}>Show</button>

					<Modal
						isOpen={this.state.show_dialog}
						onRequestClose={::this.toggle_dialog}
						// closeTimeoutMS={1000}
						style={style.modal}>

						<h1>Dialog</h1>

						<p>
							На этом этапе электрификации все потребители электроэнергии (каковыми являлись исключительно осветительные приборы) использовали постоянный ток, и существовали определенные проблемы с передачей электроэнергии на значительные расстояния. Вследствие этого источник электроэнергии располагался в непосредственной близости от потребителя. Так, например, в случае с Киевскими железнодорожными мастерскими каждый из четырех фонарей имел свою электромагнитную машину Грамма.
						</p>

						<button style={style.button} onClick={::this.toggle_dialog}>Hide</button>
					</Modal>
				</div>
			</div>
		)

		return markup
	}

	toggle_dialog()
	{
		this.setState({ show_dialog: !this.state.show_dialog }) 
	}
}

const style = styler
`
	button
		margin      : 1em auto
		padding     : 0.7em 2em
		outline     : none
		font-weight : 600
		background  : #C94E50
		color       : #FFFFFF
		border      : none

	container
		margin    : 2em
		text-align : center

	modal
		width: 40em
		line-height: 1.35em
`