import React from 'react'
import classNames from 'classnames'
import { Field } from 'simpler-redux-form'
import Text_input from '../text input'

export default function TextInput(props)
{
	return <Field
		{...props}
		component={Text_input}
		className={classNames('form__field', props.className)}/>
}