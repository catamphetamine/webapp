import React, { Component } from 'react'
import styler from 'react-styling'

import Button from './button'

export default class Menu_button extends Component
{
	render()
	{
		const svg_path = "M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"

		const markup =
		(
			<Button className="menu-button" link="/menu" action={this.props.toggle}>
				{/*<div className="menu-icon"/>*/}
				<svg className="menu-icon" style={style.icon} viewBox="0 0 24 24"><path d={svg_path}></path></svg>
			</Button>
		)

		return markup
	}
}

const style = styler
`
	icon
`