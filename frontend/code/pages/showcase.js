import React, { Component } from 'react'
import { title }            from 'react-isomorphic-render'
import styler               from 'react-styling'
import { connect }          from 'react-redux'
import Phone, { phone_number_format, is_valid_phone_number } from 'react-phone-number-input'
import { SingleDatePicker } from 'react-dates'

@connect(model => ({ navigator: model.navigator }))
export default class Form_showcase extends Component
{
	state = {}

	constructor(props, context)
	{
		super(props, context)

		this.on_selection_changed = this.on_selection_changed.bind(this)
	}

	render()
	{
		const markup =
		(
			<section className="content" style={{ padding: '1.6em' }}>
				{title("Form UI Showcase")}

				<br/>

				See <a target="_blank" href="https://halt-hammerzeit.github.io/react-responsive-ui/"><code>react-responsive-ui</code></a>

				<h2 style={style.label}>Date picker (AirBnB)</h2>
				<div className="date-picker">
					<SingleDatePicker
						id="date-picker"
						numberOfMonths={1}
						focused={this.state.focused}
						date={this.state.date}
						onDateChange={date => this.setState({ date })}
						onFocusChange={({ focused }) => this.setState({ focused })}/>
				</div>
			</section>
		)

		return markup
	}

	on_selection_changed(event)
	{
		const value = event.target.value
    	this.setState({ select_value: value })
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