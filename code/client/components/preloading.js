import React       from 'react'
import { connect } from 'react-redux'

import Spinner from './spinner'

export default connect(model => ({ pending: model.preload.pending, error: model.preload.error }))
(function Preloading(props)
{
	const markup =
	(
		<div className={"preloading " + (props.pending ? "preloading-show" : "")}>
			{ props.pending ? <div className="preloading-spinner-container"><Spinner/></div> : null }
		</div>
	)

	return markup
})