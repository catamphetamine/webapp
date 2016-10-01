import React from 'react'
import classNames from 'classnames'
import { Field } from 'simpler-redux-form'
import Dropdown from '../dropdown'

export default function DropDown(props)
{
	return <Field
		{...props}
		component={Dropdown}
		className={classNames('form__field', props.className)}/>
}