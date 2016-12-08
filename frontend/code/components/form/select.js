import React from 'react'
import classNames from 'classnames'
import { Field } from 'simpler-redux-form'
import { Select } from 'react-responsive-ui'

export default function DropDown(props)
{
	return <Field
		{...props}
		component={Select}
		className={classNames('rrui__form__field', props.className)}/>
}