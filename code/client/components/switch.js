import React, { Component, PropTypes } from 'react'
import styler from 'react-styling'

// http://wd.dizaina.net/en/experiments/ios7-style-switch/

export default class Switch extends Component
{
	static propTypes =
	{
		name      : PropTypes.string,
		value     : PropTypes.bool,
		// label     : PropTypes.string.isRequired,
		on_change : PropTypes.func.isRequired,
		style     : PropTypes.object
	};

	render()
	{
		const { value, on_change } = this.props

		const markup =
		(
			<label className="rich switch" style={ this.props.style ? merge(style.switch, this.props.style) : style.switch}>
				<input
					type="checkbox" 
					name={this.props.name} 
					style={style.input} 
					value={value} 
					onChange={event => on_change(!value)}/>

				<span className="switch-groove" style={value ? style.groove.when_checked : style.groove}/>
				<div className="switch-knob" style={value ? style.knob.when_checked : style.knob}/>

				{this.render_static()}
			</label>
		)

		return markup
	}

	// supports disabled javascript
	render_static()
	{
		const markup =
		(
			<div className="rich-fallback">
				<input
					type="checkbox" 
					name={this.props.name} 
					value={this.props.value}/>
			</div>
		)

		return markup
	}
}

const style = styler
`
	switch
		display: inline-block
		position: relative
		// cursor: pointer

		-webkit-user-select : none
		-moz-user-select    : none
		-ms-user-select     : none
		user-select         : none

		-webkit-tap-highlight-color: transparent
		tap-highlight-color: transparent

	input
		opacity: 0
		position: absolute

	groove
		position: relative
		display: inline-block
		width: 1.65em
		height: 1em
		background: white
		box-shadow: inset 0 0 0 0.0625em #d7d7d7
		// #e9e9e9
		border-radius: 0.5em
		// vertical-align: -0.15em
		transition: all 0.40s cubic-bezier(.17,.67,.43,.98)

		&when_checked
			box-shadow: inset 0 0 0 0.73em #4cd964

	knob
		position: absolute
		display: block
		width: 0.875em
		height: 0.875em
		border-radius: 0.4375em
		top: 0.0625em
		left: 0.0625em
		background: white
		// box-shadow: inset 0 0 0 0.03em rgba(0,0,0,0.1), 0 0 0.05em rgba(0,0,0,0.05), 0 0.1em 0.2em rgba(0,0,0,0.2)
		box-shadow: inset 0 0 0 0.03em rgba(0,0,0,0.3), 0 0 0.05em rgba(0,0,0,0.05), 0 0.1em 0.2em rgba(0,0,0,0.2)
		transition: all 0.25s ease-out

		&when_checked
			left: 0.7125em
`