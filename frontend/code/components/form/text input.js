import React from 'react'
import classNames from 'classnames'
import { Field } from 'simpler-redux-form'
import { TextInput } from 'react-responsive-ui'

export default function Text_input(props)
{
	return <Field
		{...props}
		component={TextInput}
		className={classNames('rrui__form__field', props.className)}/>
}