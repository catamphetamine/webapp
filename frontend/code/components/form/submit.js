import React, { Component } from 'react'
import classNames from 'classnames'
import { Submit } from 'simpler-redux-form'
import { Button } from 'react-responsive-ui'

export default class Submit_button extends Component
{
	render()
	{
		const { className } = this.props

		return <Submit
			{ ...this.props }
			component={ Button }
			submit
			className={ classNames('button--primary', className) }/>
	}
}