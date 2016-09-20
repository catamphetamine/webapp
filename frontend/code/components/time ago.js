import React from 'react'
import React_time_ago from 'react-time-ago'
import Tooltip from './tooltip'

export default function Time_ago(props)
{
	return <React_time_ago {...props} wrapper={Wrapper}/>
}

function Wrapper({ verbose, children })
{
	return <Tooltip text={verbose} container={() => document.querySelector('.content')}>{children}</Tooltip>
}