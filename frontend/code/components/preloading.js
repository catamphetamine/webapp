import React, { PropTypes } from 'react'
import { connect }          from 'react-redux'
import classNames           from 'classnames'

import Spinner from './spinner'

@connect(model => ({ pending: model.preload.pending, error: model.preload.error }))
export default class Preloading extends React.Component
{
	static propTypes = 
	{
		pending : PropTypes.bool
	}

	render()
	{
		const { pending } = this.props

		const markup =
		(
			<div className={classNames('preloading', { 'preloading--shown' : pending })}>
				{pending && <div className="preloading-spinner-container"><Spinner/></div>}
			</div>
		)

		return markup
	}
}