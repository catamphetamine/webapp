// require('./about.less' )

import React, { Component, PropTypes } from 'react'
import { bindActionCreators as bind_action_creators } from 'redux'
import { connect } from 'react-redux'
import { get as get_settings } from '../actions/settings'

@connect
(
	store => 
	({
		settings : store.settings.data,
		error    : store.settings.error
	}),
	dispatch => bind_action_creators({ get_settings }, dispatch)
)
export default class About extends Component
{
	static propTypes =
	{
		get_settings : PropTypes.func.isRequired,
		settings     : PropTypes.object,
		error        : PropTypes.object
	}

	static preload(store)
	{
		const promises = []
		// if (!are_settings_loaded(store.getState()))
		// {
			promises.push(store.dispatch(get_settings()))
		// }
		return Promise.all(promises)
	}

	render()
	{
		const { error, settings } = this.props

		let content

		if (error)
		{
			content = 
			(
				<div>
					Error: {error.stack || error.message}
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

const are_settings_loaded = (global_state) => global_state.settings && global_state.settings.loaded