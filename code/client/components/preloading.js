import React, { PropTypes } from 'react'
import { connect }          from 'react-redux'

import Spinner from './spinner'

@connect(model => ({ pending: model.preload.pending, error: model.preload.error }))
export default class Preloading extends React.Component
{
	static propTypes = 
	{
		pending : PropTypes.bool,
		error   : PropTypes.any
	}

	render()
	{
		const markup =
		(
			<div className={"preloading " + (this.props.pending ? "preloading-show" : "")}>
				{ this.props.pending ? <div className="preloading-spinner-container"><Spinner/></div> : null }
			</div>
		)

		return markup
	}
}