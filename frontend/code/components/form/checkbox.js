import React from 'react'
import classNames from 'classnames'
import { Field } from 'simpler-redux-form'
import Checkbox from '../checkbox'

export default function CheckBox(props)
{
	return <Field
		{...props}
		component={Checkbox}
		className={classNames('form__field', props.className)}/>
}