// require('./about.less' )

import React, { Component } from 'react'
import { webpage_title } from '../../webpage head'
import styler from 'react-styling'

import { connect } from 'react-redux'

@connect
(
	store => ({ })
)
export default class Form extends Component
{
	state = 
	{
		text_value: 'Text',
		select_value: 'B',
		textarea_value: 'Lorem ipsum'
	}

	render()
	{
		const markup = 
		(
			<div>
				{webpage_title("Form UI Showcase")}

				<form style={style.form}>
					<label style={style.form.label}>{'Text input field'}</label>
					<input type="text" style={style.form.input} value={this.state.text_value} onChange={this.on_input_text_changed}/>
					You entered: {this.state.text_value}

					<label style={style.form.label}>{'Select'}</label>
					<select style={style.form.select} value={this.state.select_value} onChange={this.on_selection_changed}>
						<option value="A">Apple</option>
						<option value="B">Banana</option>
						<option value="C">Cranberry</option>
					</select>
					You selected: {this.state.select_value}

					<label htmlFor="description" style={style.form.label}>{'Textarea'}</label>
					<textarea name="description" style={style.form.textarea} value={this.state.textarea_value} onChange={this.on_textarea_text_changed}/>
					You entered: {this.state.textarea_value}
				</form>
			</div>
		)

		return markup
	}

	on_input_text_changed = event =>
	{
		const value = event.target.value
		// you can validate value here
    	this.setState({ text_value: value })
	}

	on_selection_changed = event =>
	{
		const value = event.target.value
    	this.setState({ select_value: value })
	}

	on_textarea_text_changed = event =>
	{
		const value = event.target.value
		// you can validate value here
    	this.setState({ textarea_value: value })
	}
}

const style = styler
`
	form
		padding: 1em

		input
			padding: .5em
			margin-top: 1em
			margin-right: 1em

		select
			padding: .5em
			margin-top: 1em
			margin-right: 1em

		textarea
			padding: .5em
			margin-top: 1em
			margin-right: 1em

		label
			display: block
			margin-top: 1em
			font-weight: bold
`