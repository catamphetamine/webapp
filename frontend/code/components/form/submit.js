import React from 'react'
import classNames from 'classnames'
import { Submit } from 'simpler-redux-form'
import Button from '../button'

export default function Submit_button(props)
{
	return <Submit
		{...props}
		component={Button}
		submit={true}
		className={classNames('form__action--submit', props.className)}/>
}