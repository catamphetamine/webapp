import React, { Component, PropTypes } from 'react'

import { bindActionCreators as bind_action_creators } from 'redux'

import { connect }        from 'react-redux'
import { defineMessages } from 'react-intl'
import styler             from 'react-styling'
import { title }          from 'react-isomorphic-render'
import { preload }        from 'react-isomorphic-render/redux'

import { get as get_log } from '../actions/log'
import log_levels         from '../../common/log levels'

import international      from '../international/internationalize'

const messages = defineMessages
({
	entry_message:
	{
		id             : 'log.entry.message',
		description    : 'Log entry message text',
		defaultMessage : 'message'
	}
})

@preload((dispatch, get_state) => dispatch(get_log()))
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
export default class Log extends Component
{
	static propTypes =
	{
		get_log : PropTypes.func.isRequired,
		log     : PropTypes.array,
		error   : PropTypes.object
	};

	render()
	{
		const { error, log } = this.props

		const translate = this.props.intl.formatMessage

		const markup = 
		(
			<div>
				{title("Log")}

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