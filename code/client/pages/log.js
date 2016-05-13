import React, { Component, PropTypes } from 'react'

import { bindActionCreators as bind_action_creators } from 'redux'

import { connect }        from 'react-redux'
import { defineMessages } from 'react-intl'
import styler             from 'react-styling'
import { title }          from 'react-isomorphic-render'
import { preload }        from 'react-isomorphic-render/redux'
import { FormattedDate }  from 'react-intl'

import { get as get_log } from '../actions/log'
import log_levels         from '../../common/log levels'

import { messages as layout_messages } from './layout'

import international      from '../international/internationalize'

import { parse_stack_trace } from '../../common/html stack trace'

import Modal from '../components/modal'

export const messages = defineMessages
({
	entry_message:
	{
		id             : 'log.entry.message',
		description    : 'Log entry message text',
		defaultMessage : 'message'
	},
	show_stack_trace:
	{
		id             : 'log.entry.show_stack_trace',
		description    : 'Log entry show stack trace button',
		defaultMessage : 'More'
	},
	hide_stack_trace:
	{
		id             : 'log.entry.hide_stack_trace',
		description    : 'Log entry stack trace modal hide button',
		defaultMessage : 'Dismiss'
	}
})

@preload((dispatch, get_state) => dispatch(get_log()))
@connect
(
	model => 
	({
		log   : model.log.data,
		error : model.log.error
	}),
	dispatch => bind_action_creators({ get_log }, dispatch)
)
@international()
export default class Log extends Component
{
	state =
	{
		show_stack_trace: false
	}

	static propTypes =
	{
		get_log : PropTypes.func.isRequired,
		log     : PropTypes.array,
		error   : PropTypes.object
	}

	constructor(props, context)
	{
		super(props, context)

		this.render_log_entry = this.render_log_entry.bind(this)
		this.hide_stack_trace = this.hide_stack_trace.bind(this)
	}

	render()
	{
		const { error, log, translate } = this.props

		const markup = 
		(
			<div>
				{title(this.props.translate(layout_messages.menu_log))}

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
							{log.map(this.render_log_entry)}
						</tbody>
					</table>
				</section>

				{/* Error stack trace */}
				<Modal
					isOpen={this.state.show_stack_trace}
					onRequestClose={this.hide_stack_trace}
					style={style.stack_trace_modal}>

					<h1 style={style.stack_trace.title}>{this.state.error_message}</h1>

					{!this.state.stack_trace ? null : this.state.stack_trace.map(stack =>
					{
						const markup = 
						(
							<div style={style.stack_trace}>
								<h2 style={style.stack_trace.stack.title}>{stack.title}</h2>

								<ul style={style.stack_trace.stack}>
									{stack.lines.map(line =>
									{
										const markup = 
										(
											<li style={style.stack_trace.stack.line}>
												{this.render_stack_trace_line(line)}
											</li>
										)

										return markup
									})}
								</ul>
							</div>
						)

						return markup
					})}

					<button style={style.stack_trace_modal.button} onClick={this.hide_stack_trace}>
						{translate(messages.hide_stack_trace)}
					</button>
				</Modal>
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
				<td>
					<FormattedDate
						value={entry.time}
						year='numeric'
						month='long'
						day='numeric'
						weekday='long'
						hour='2-digit'
						minute='2-digit'
						second='2-digit'/>
				</td>
				<td>
					{entry.msg}
					{!entry.err ? null :
					<span>
						{' '}
						<button 
							onClick={() => this.show_stack_trace(parse_stack_trace(entry.err.stack), entry.msg)}>
							{this.props.translate(messages.show_stack_trace)}
						</button>
					</span>}
				</td>
			</tr>
		)

		return markup
	}

	render_stack_trace_line(line_info)
	{
		if (typeof line_info === 'string')
		{
			return line_info
		}

		let line = []

		if (line_info.file_path)
		{
			line.push(<span style={style.stack_trace.stack.line.file_name}>{line_info.file_name}</span>)
		}

		if (line_info.file_line_number)
		{
			line.push(<span style={style.stack_trace.stack.line.colon}>:</span>)
			line.push(<span style={style.stack_trace.stack.line.file_line_number}>{line_info.file_line_number}</span>)
		}

		if (line_info.method_path)
		{
			if (line.length > 0)
			{
				line.push(<span> </span>)
			}

			line.push(<span style={style.stack_trace.stack.line.method_path}>{line_info.method_path}</span>)
		}

		if (line_info.file_path)
		{	
			line.push(<div style={style.stack_trace.stack.line.file_path}>{line_info.file_path}</div>)
		}

		return <span>{line}</span>
	}

	show_stack_trace(stack_trace, error_message)
	{
		this.setState
		({
			show_stack_trace: true,
			stack_trace,
			error_message
		})
	}

	hide_stack_trace()
	{
		this.setState({ show_stack_trace: false })
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

	stack_trace_modal
		font-family : Monospace

		button
			float : right

	stack_trace
		title
		stack
			margin-left     : 1.6em
			padding         : 0
			list-style-type : none

			title
				color : #C44100

			line
				margin-bottom: 1.2em

				colon
					opacity : 0.5
				file_name
					font-weight : bold
				file_path
					opacity : 0.5
					margin-top: 0.2em
				method_path
					color       : #0091C2
					font-weight : bold
				file_line_number
`