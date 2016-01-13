import React, { Component } from 'react'
import styler from 'react-styling'

export default class Menu_button extends Component
{
	render()
	{
		const path = "M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"

		console.log(style)

		const markup =
		(
			<button className="menu-button" onClick={this.props.toggle}>
				{/*<div className="menu-icon"/>*/}
				<svg className="menu-icon" style={style.icon} viewBox="0 0 24 24"><path d={path}></path></svg>
			</button>
		)

		return markup
	}
}

const style = styler
`
	icon
`