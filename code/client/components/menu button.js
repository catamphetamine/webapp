import React, { Component } from 'react'
// import styler from 'react-styling'

export default class Menu_button extends Component
{
	render()
	{
		const markup =
		(
			<button className="menu-button" onClick={this.props.toggle}>
				<div className="menu-icon"/>
			</button>
		)

		return markup
	}
}