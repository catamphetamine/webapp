import React, { Component, PropTypes } from 'react'
import { webpage_title } from '../webpage head'
import { bindActionCreators as bind_action_creators } from 'redux'
import { connect } from 'react-redux'
import { get as get_log } from '../actions/log'
import { defineMessages } from 'react-intl'
import log_levels from '../../common/log levels'
import styler from 'react-styling'
import preload from '../redux/preload'
import international from '../internationalize'

const messages = defineMessages
({
	entry_message:
	{
		id             : 'log.entry.message',
		description    : 'Log entry message text',
		defaultMessage : 'message'
	}
})

@preload
(
	function(get_state, dispatch)
	{
		const promises = []

		promises.push(dispatch(get_log()))
		
		return Promise.all(promises)
	}
)
@connect
(
	store => 
	({
		log   : store.log.data,
		error : store.log.error
	}),
	dispatch => bind_action_creators({ get_log }, dispatch)
)
@international()
export default class Page extends Component
{
	static propTypes =
	{
		get_log : PropTypes.func.isRequired,
		log     : PropTypes.array,
		error   : PropTypes.object
	}

	render()
	{
		const { error, log } = this.props

		const translate = this.props.intl.formatMessage

		let content

		if (error)
		{
			content = 
			(
				<section className="content">
					Error: {error.stack || error.message}
				</section>
			)
		}
		else if (log)
		{
			content = 
			(
				<section className="content">
					<table>
						<thead>
							<tr>
								<th>pid</th>
								<th>hostname</th>
								<th>name</th>
								<th>date</th>
								<th>{translate(messages.entry_message)}</th>
							</tr>
						</thead>

						<tbody>
							{log.map(::this.render_log_entry)}
						</tbody>
					</table>
				</section>
			)
		}
		else
		{
			content = 
			(
				<section className="content">
					Loading
				</section>
			)
		}

		const markup = 
		(
			<div>
				{webpage_title("Log")}
				{content}
			</div>
		)

		return markup
	}

	render_log_entry(entry, index)
	{
		const markup = 
		(
			<tr key={index} style={style.log.entry[(log_levels[entry.level] || 'generic').toLowerCase()]}>
				<td>{entry.pid}</td>
				<td>{entry.hostname}</td>
				<td>{entry.name}</td>
				<td>{new Date(entry.time).toString()}</td>
				<td>{entry.msg}</td>
			</tr>
		)

		return markup
	}
}

const style = styler
`
	log
		entry
			&error
				background: #FFC9C9

			&warning
				background: #FFFBC9

			&generic

`