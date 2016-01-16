import React, { Component } from 'react'
import { title }            from 'react-isomorphic-render'
import styler               from 'react-styling'
import { connect }          from 'react-redux'

import Text_input   from '../../components/text input'
import Checkbox     from '../../components/checkbox'
import Dropdown     from '../../components/dropdown'
import Switch       from '../../components/switch'
import Button_group from '../../components/button group'
import Spinner      from '../../components/spinner'

import { DatePicker as Date_picker } from 'material-ui/lib/date-picker'
import { CircularProgress as Circular_progress } from 'material-ui/lib'

@connect
(
	store => ({ })
)
export default class Form extends Component
{
	state = 
	{
		text_value     : 'Text',
		select_value   : 'B',
		textarea_value : 'Lorem ipsum',
		checked        : true,
		// selected: 'A',
		// switched: true,
	}

	render()
	{
		const markup = 
		(
			<div>
				{title("Form UI Showcase")}

				<form style={style.form}>
					<h2 style={style.form.label}>{'Text input field'}</h2>
					<Text_input style={style.form.input} value={this.state.text_value} on_change={value => this.setState({ text_value: value })} placeholder="Enter text"/>
					You entered: {this.state.text_value}

					<h2 style={style.form.label}>{'Textarea'}</h2>
					<Text_input multiline={true} name="description" style={style.form.textarea} value={this.state.textarea_value} on_change={value => this.setState({ textarea_value: value })} placeholder="Enter text"/>
					You entered: {this.state.textarea_value}

					<h2 style={style.form.label}>{'Select'}</h2>
					<select style={style.form.select} value={this.state.select_value} onChange={this.on_selection_changed}>
						<option value="A">Apple</option>
						<option value="B">Banana</option>
						<option value="C">Cranberry</option>
					</select>
					You selected: {this.state.select_value}

					<h2 style={style.form.label}>Dropdown</h2>
					<Dropdown style={style.form.checkbox} value={this.state.selected} options={[{ value: 'A', label: 'Apple' }, { value: 'B', label: 'Banana' }, { value: 'C', label: 'Cranberry' }, { value: 'D', label: 'Date' }, { value: 'E', label: 'Elderberry' }, { value: 'F', label: 'Fig' }, { value: 'G', label: 'Garlic' }]} label="Choose" select={ selected => this.setState({ selected: selected }) }/>
					You selected: {this.state.selected ? this.state.selected : 'nothing'}

					<h2 style={style.form.label}>Checkbox</h2>
					<Checkbox style={style.form.checkbox} label="Checkbox" value={this.state.checked} on_change={ checked => this.setState({ checked: checked }) }/>
					You checked: {this.state.checked ? 'checked' : 'unchecked'}

					<h2 style={style.form.label}>Switch</h2>
					<div style={style.form.switch_container}>
						<label style={style.form.switch_label}>iOS style switch</label>
						<Switch style={style.form.switch} value={this.state.switched} on_change={ switched => this.setState({ switched: switched }) }/>
					</div>
					You switched: {this.state.switched ? 'on' : 'off'}

					<h2 style={style.form.label}>Button group</h2>
					<Button_group style={style.form.checkbox} options={[{ value: 'A', label: 'Apple' }, { value: 'B', label: 'Banana' }, { value: 'C', label: 'Cranberry' }]} value={this.state.button_group} on_change={ value => this.setState({ button_group: value }) }/>
					You selected: {this.state.button_group ? this.state.button_group : 'nothing'}

					<h2 style={style.form.label}>File upload</h2>
					<div className="file-upload">
						<div className="file-upload-button">
							<button>File</button>
							<input multiple="true" type="file" style={style.form.file} onChange={event =>
							{
								const files = event.target.files
								const file_names = []

								// `files` is not an array
								let i = 0
								while (i < files.length)
								{
									file_names.push(files[i].name)
									i++
								}

								this.setState({ file_list : file_names.join(", ") })
							}}/>
						</div>

						<div className="file-upload-list">
							<input type="text" placeholder="Upload one or more files" value={this.state.file_list}/>
						</div>
					</div>

					<h2 style={style.form.label}>Spinner</h2>
					<Spinner style={style.form.spinner}/>

					<h2 style={style.form.label}>Date picker (part of Material UI)</h2>
					<div className="date-picker">
						<Date_picker style={style.form.date_picker} hintText="Portrait Dialog" autoOk={true} container="inline" textFieldStyle={style.form.date_picker.input} hintStyle={style.form.date_picker.hint} underlineShow={false}/>
					</div>
				</form>
			</div>
		)

		return markup
	}

	on_selection_changed = event =>
	{
		const value = event.target.value
    	this.setState({ select_value: value })
	}
}

const style = styler
`
	form
		margin-top: 2em

		input
			margin-top: 1em
			margin-right: 1em
			margin-bottom: 1em

		select
			margin-top: 0em
			margin-right: 1em
			margin-bottom: 1em

		textarea
			margin-top: 0em
			margin-right: 1em
			margin-bottom: 1em

		label
			display: block
			margin-top: 1.6em
			margin-bottom: 0.8em
			font-size: 1.4em
			// font-weight: bold

		checkbox
			display: block
			margin-top: 1em
			margin-bottom: 1em

		switch_container
			// margin-top: 1em
			margin-bottom: 1em

		switch_label
			display: inline-block
			margin-bottom: 0.14em

		switch
			// margin-top: 1em
			margin-left: 1.5em
			vertical-align: bottom

		date_picker

			input
				height: auto
				width: auto

				font-size: inherit
				font-family: inherit
				line-height: inherit

			hint
				bottom: 0
				transition: none
				// transition: all 50ms ease-out
				// transition: all 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms


		spinner
`