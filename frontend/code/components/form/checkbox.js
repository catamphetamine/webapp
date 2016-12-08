import React from 'react'
import classNames from 'classnames'
import { Field } from 'simpler-redux-form'
import { Checkbox } from 'react-responsive-ui'

export default function CheckBox(props)
{
	return <Field
		{...props}
		component={Checkbox}
		className={classNames('rrui__form__field', props.className)}/>
}