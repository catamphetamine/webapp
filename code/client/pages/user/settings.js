import React, { Component, PropTypes } from 'react'
import { title }                       from 'react-isomorphic-render'
import { preload }                     from 'react-isomorphic-render/redux'
import { connect }                     from 'react-redux'
import styler                          from 'react-styling'
import { defineMessages }              from 'react-intl'
import React_time_ago                  from 'react-time-ago'
import classNames                      from 'classnames'

import { FormattedDate } from 'react-intl'

import international from '../../international/internationalize'

import { get_user }  from '../../actions/user settings'
import { get_user_authentication_tokens }  from '../../actions/authentication'

import { messages as authentication_form_messages } from '../../components/authentication form'

import Text_input from '../../components/text input'

const messages = defineMessages
({
	header:
	{
		id             : 'user.settings.header',
		description    : 'User account settings page header',
		defaultMessage : 'Settings'
	},
	authentication_tokens:
	{
		id             : 'user.settings.authentication_tokens',
		description    : 'User account authentication tokens',
		defaultMessage : 'Authentication tokens'
	}
})

@preload((dispatch, get_state, location, parameters) =>
{
	return Promise.all
	([
		dispatch(get_user(get_state().authentication.user.id)),
		dispatch(get_user_authentication_tokens())
	])
})
@connect
(
	model =>
	({
		user                  : model.user_settings.user,
		authentication_tokens : model.authentication.tokens
	})
)
@international()
export default class Settings_page extends Component
{
	static propTypes =
	{
		user                  : PropTypes.object.isRequired,
		authentication_tokens : PropTypes.array.isRequired
	}

	state = {}

	constructor(props, context)
	{
		super(props, context)

		this.state.email = props.user.email

		this.revoke_authentication_token = this.revoke_authentication_token.bind(this)
	}

	render()
	{
		const { user, authentication_tokens, translate } = this.props

		const markup = 
		(
			<div className="content  user-settings">
				{title(translate(messages.header))}

				<h1 style={style.header}>
					{translate(messages.header)}
				</h1>

				{/* User's personal info */}
				<section
					className={classNames(
						'content-section'
					)}>

					<label htmlFor="email">{translate(authentication_form_messages.email)}</label>

					<Text_input
						value={this.state.email}
						name="email"
						validate={this.validate_email_on_sign_in}
						on_change={email => this.setState({ email })}
						placeholder={translate(authentication_form_messages.email)}/>
				</section>

				{/* Authentication tokens table */}
				<section
					className={classNames(
						'content-section'
					)}>

					<h2>{translate(messages.authentication_tokens)}</h2>

					<table>
						<thead>
							<tr>
								<th>Token</th>
								<th>Issued</th>
								<th>Status</th>
								<th>Activity</th>
							</tr>
						</thead>

						<tbody>
							{authentication_tokens.map((token, token_index) =>
							{
								const markup =
								(
									<tr key={token_index}>
										<td>{token._id}</td>

										<td>
											<FormattedDate
												value={token.created}
												year='numeric'
												month='2-digit'
												day='2-digit'/>
										</td>

										<td>
											{/* If the token was revoked, show revocation date */}
											{token.revoked &&
												<span>
													Revoked on
													<FormattedDate
														value={token.revoked}
														year='numeric'
														month='2-digit'
														day='2-digit'/>
												</span>
											}

											{/* If the token wasn't revoked then it's valid */}
											{!token.revoked &&
												<span>
													Valid
													<button onClick={this.revoke_authentication_token}>Revoke</button>
												</span>
											}
										</td>

										<td>
											<ul>
												{token.history.map((activity, activity_index) =>
												{
													return <li key={activity_index}>
														{activity.ip} (city, country),
														{/*
														<FormattedDate
															value={activity.time}
															year='numeric'
															month='2-digit'
															day='2-digit'
															hour='2-digit'
															minute='2-digit'/>
														*/}
														<React_time_ago date={new Date(activity.time)}/>
													</li>
												})}
											</ul>
										</td>
									</tr>
								)

								return markup
							})}
						</tbody>
					</table>
				</section>
			</div>
		)

		return markup
	}

	revoke_authentication_token()
	{

	}
}

const style = styler
`
	header
		text-align: center
`