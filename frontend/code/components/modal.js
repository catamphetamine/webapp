import React, { PropTypes } from 'react'
import { Modal } from 'react-responsive-ui'

import default_messages from './messages'

export default function modal(props, context)
{
	const translate = context.intl.formatMessage

	return <Modal
		{...props}
		cancelLabel={translate(default_messages.cancel)}
		afterOpen={(options) =>
		{
			const header = document.querySelector('header')

			header.style.right = options.scrollbarWidth + 'px'

			if (props.afterOpen)
			{
				props.afterOpen(options)
			}
		}}
		afterClose={() =>
		{
			const header = document.querySelector('header')

			header.style.right = 0

			if (props.afterClose)
			{
				props.afterClose()
			}
		}}/>
}

modal.contextTypes =
{
	intl : PropTypes.object
}