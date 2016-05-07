import React, { Component, PropTypes } from 'react'
import styler from 'react-styling'

export default class Flag extends Component
{
	static propTypes =
	{
		locale : PropTypes.string.isRequired
	}

	render()
	{
		const { locale } = this.props

		let flag = flags[locale] 

		if (!flag)
		{
			return null
		}

		const styling = this.props.style ? merge(style.image, this.props.style) : style.image

		const markup = 
		(
			<img style={styling} src={flag}/>
		)

		return markup
	}
}

const flags =
{
	'en' : require(`../../../assets/images/flags/United-States-of-America.png`),
	'ru' : require(`../../../assets/images/flags/Russia.png`),
	// add flags here
}

const style = styler
`
	image
		border-style: solid
		border-width: 1px
		border-color: #bfbfbf
		border-radius: 4px
`