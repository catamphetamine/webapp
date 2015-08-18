// require('./about.less' )

import React, { Component } from 'react'
import DocumentMeta from 'react-document-meta'
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
			<div>
				<DocumentMeta title="Page not found"/>

				<div>Not found</div>
			</div>
		)

		return markup
	}
}