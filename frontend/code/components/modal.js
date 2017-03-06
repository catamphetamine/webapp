import React, { PropTypes } from 'react'
import { Modal } from 'react-responsive-ui'

import default_messages from './messages'

export default function ModalWindow(props, context)
{
	const translate = context.intl.formatMessage

	return <Modal
		closeLabel={ translate(default_messages.cancel) }
		{ ...props }/>
}

ModalWindow.contextTypes =
{
	intl : PropTypes.object
}