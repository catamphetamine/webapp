import React, { PropTypes } from 'react'
import { connect }          from 'react-redux'
import classNames           from 'classnames'

import Spinner from './spinner'

@connect(state =>
({
	pending   : state.preload.pending,
	immediate : state.preload.immediate,
	error     : state.preload.error
}))
export default class Preloading extends React.Component
{
	static propTypes =
	{
		pending : PropTypes.bool
	}

	render()
	{
		const { pending, immediate } = this.props

		const markup =
		(
			<div className={classNames('preloading',
			{
				'preloading--shown' : pending,
				'preloading--immediate' : immediate
			})}>
				{pending && <div className="preloading-spinner-container"><Spinner/></div>}
			</div>
		)

		return markup
	}
}