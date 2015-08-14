// require('./about.less' )

import React, { Component } from 'react'
import { connect } from 'react-redux'

@connect
(
	store => ({ })
)
export default class Not_found extends Component
{
	render()
	{
		const markup =
		(
			<div>Not found</div>
		)

		return markup
	}
}