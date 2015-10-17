// require('./editor.less')

import React, { Component, PropTypes } from 'react'
import { webpage_title } from '../webpage head'
import { connect } from 'react-redux'

import styler from 'react-styling'

@connect
(
	store => ({ })
)
export default class Editor extends Component
{
	render()
	{
		const markup = 
		(
			<div>
				{webpage_title("Rich Text Editor")}

				<div contentEditable="true" style={style.editor} ref={function(element)
				{
					if (element != null)
					{
						element.focus()
					}
				}}/>
			</div>
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