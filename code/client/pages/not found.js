import React, { Component } from 'react'
import { title }            from 'react-isomorphic-render'
import { connect }          from 'react-redux'

import styler from 'react-styling'

@connect
(
	store => ({ })
)
export default class Not_found extends Component
{
	render()
	{
		const markup =
		(
			<section className="content">
				{title("Page not found")}

				<h1 style={style.header}>
					Page not found
				</h1>
			</section>
		)

		return markup
	}
}

const style = styler
`
	header
		text-align: center
`