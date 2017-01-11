import React, { Component } from 'react'
import { title }            from 'react-isomorphic-render'
import styler               from 'react-styling'
import { connect }          from 'react-redux'
import { DatePicker }       from 'react-responsive-ui'

export default class Form_showcase extends Component
{
	render()
	{
		const markup =
		(
			<section className="content" style={{ padding: '1.6em' }}>
				{title("Form UI Showcase")}

				<br/>

				See <a target="_blank" href="https://halt-hammerzeit.github.io/react-responsive-ui/"><code>react-responsive-ui</code></a>
			</section>
		)

		return markup
	}
}

const style = styler
`
	form
		margin-top : 2em

	input
		margin-top    : 1em
		margin-right  : 1em
		margin-bottom : 1em

	select
		margin-top    : 0em
		margin-right  : 1em
		margin-bottom : 1em

	textarea
		margin-top    : 0em
		margin-right  : 1em
		margin-bottom : 1em

	label
		display       : block
		margin-top    : 1.6em
		margin-bottom : 0.8em
		font-size     : 1.4em

	checkbox
		display       : block
		margin-top    : 1em
		margin-bottom : 1em

	switch_container
		margin-bottom : 1em

	switch_label
		display       : inline-block
		margin-bottom : 0.14em

	switch
		margin-left    : 1.5em
		vertical-align : bottom

	date_picker
		input
			height : auto
			width  : auto

			font-size   : inherit
			font-family : inherit
			line-height : inherit

		hint
			bottom     : 0
			transition : none

	phone
		display     : inline-block
		margin-left : 0.3em

	dropdown_icon_style
		width         : 1em
		margin-bottom : -0.05em
		border        : 1px solid #5f5f5f
`