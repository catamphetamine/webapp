import React from 'react'
import classNames from 'classnames'
import { Submit } from 'simpler-redux-form'
import { Button } from 'react-responsive-ui'

export default function Submit_button(props)
{
	return <Submit
		{ ...props }
		component={ Button }
		submit
		className={ classNames('button--primary form__action--submit', props.className) }/>
}