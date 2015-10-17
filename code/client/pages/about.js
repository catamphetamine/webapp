// require('./about.less' )

import React, { Component, PropTypes } from 'react'
import { webpage_title } from '../webpage head'
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

	static contextTypes =
	{
		store : PropTypes.object.isRequired
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

	componentDidMount()
	{
		// to do: remove second loading here for client-side navigation
		// to do: remove loading here for server-side rendered page
		if (window.client_side_routing)
		{
			this.constructor.preload(this.context.store)
		}
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
		else if (settings)
		{
			content = 
			(
				<div>
					<p>These values were loaded dynamically from the server (via ajax) using REST api:</p>
					<div>Putin: {settings.putin}</div>
					<div>Version: {settings.version}</div>
				</div>
			)
		}
		else
		{
			content = 
			(
				<div>Loading</div>
			)
		}

		const markup = 
		(
			<div>
				{webpage_title("About")}
				{content}
			</div>
		)

		// <div>Copyright © 2015</div>

		return markup
	}
}

const are_settings_loaded = (global_state) => global_state.settings && global_state.settings.loaded