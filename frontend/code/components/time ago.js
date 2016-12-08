import React from 'react'
import React_time_ago from 'react-time-ago'
import { Tooltip } from 'react-responsive-ui'

export default function Time_ago(props)
{
	return <React_time_ago {...props} wrapper={Wrapper}/>
}

function Wrapper({ verbose, children })
{
	// Not using `container` here because
	// it wouldn't work on the document.body level
	// (e.g. in a modal)

	// container={() => document.querySelector('.content')}
	return <Tooltip text={verbose}>{children}</Tooltip>
}