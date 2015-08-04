// require('./about.less' )

import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as actions from '../flux/actions/actions'

class About extends Component
{
	static propTypes =
	{
		get_settings: PropTypes.func.isRequired,
		settings: PropTypes.object.isRequired,
		error: PropTypes.object.isRequired
	}

	componentDidMount()
	{
		this.props.get_settings()
	}

	// componentWillUnmount()
	// {
	// 	this.off()
	// }

	render()
	{
		const { error, settings } = this.props

		let content

		if (error)
		{
			console.log(error)
			content = 
			(
				<div>
					Error: {error.stack || error.message}
				</div>
			)
		}
		else
		{
			content = 
			(
				<div>
					<div>Putin: {settings.putin}</div>
					<div>Version: {settings.version}</div>
				</div>
			)
		}
		// else if (settings.loading)
		// {
		// 	content = 
		// 	(
		// 		<div>
		// 			Loading...
		// 		</div>
		// 	)
		// }

		const markup = 
		(
			<div>
				{content}
			</div>
		)

		// <div>Copyright © 2015</div>

		return markup
	}
}

import {is_loaded as are_settings_loaded} from '../flux/stores/settings'

@connect(store =>
({
	settings: store.settings.data,
	error: store.settings.error
}))
export default class Reduxed
{
	static propTypes =
	{
		settings: PropTypes.object,
		dispatch: PropTypes.func.isRequired
	}

	static preload(store)
	{
		const promises = []
		// if (!are_settings_loaded(store.getState()))
		// {
			promises.push(store.dispatch(actions.get_settings()))
		// }
		return Promise.all(promises)
	}

	render()
	{
		const { error, settings, dispatch } = this.props
		return <About error={error} settings={settings} {...this.props} {...bindActionCreators(actions, dispatch)}/>
	}
}