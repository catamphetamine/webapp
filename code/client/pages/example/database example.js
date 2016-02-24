import React, { Component } from 'react'
import { title }            from 'react-isomorphic-render'
import styler               from 'react-styling'
import { connect }          from 'react-redux'

export default class Page extends Component
{
	render()
	{
		const markup = 
		(
			<section>
				{title("Simple REST API example")}

				<div style={style.container}>
					{'This is an example of REST API usage with database persistence (to be done)'}
				</div>
			</section>
		)

		return markup
	}
}

const style = styler
`
	container
		padding    : 2em
		text-align : center
`