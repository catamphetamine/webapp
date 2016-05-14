import React, { Component, PropTypes } from 'react'
import { title }                       from 'react-isomorphic-render'
import { preload }                     from 'react-isomorphic-render/redux'
import { connect }                     from 'react-redux'
import styler                          from 'react-styling'
import { defineMessages }              from 'react-intl'
import React_time_ago                  from 'react-time-ago'
import classNames                      from 'classnames'

import { bindActionCreators as bind_action_creators } from 'redux'

import { FormattedDate } from 'react-intl'

import international from '../../international/internationalize'

import
{
	get_user,
	get_user_authentication_tokens,
	revoke_authentication_token,
	change_email,
	load_advanced_settings
}
from '../../actions/user settings'

import { messages as authentication_form_messages } from '../../components/authentication form'
import default_messages from '../../components/messages'

import Text_input from '../../components/text input'
import Button from '../../components/button'

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
	},
	revoke_authentication_token:
	{
		id             : 'user.settings.revoke_authentication_token',
		description    : 'User account authentication token revocation action',
		defaultMessage : 'Revoke'
	},
	revoke_authentication_token_failed:
	{
		id             : 'user.settings.revoke_authentication_token_failed',
		description    : 'User account authentication token revocation action failed',
		defaultMessage : `Couldn't revoke authentication token`
	},
	authentication_token_valid:
	{
		id             : 'user.settings.authentication_token_valid',
		description    : 'User account authentication token valid status',
		defaultMessage : 'Valid'
	},
	authentication_token_revoked:
	{
		id             : 'user.settings.authentication_token_revoked',
		description    : 'User account authentication token revoked status',
		defaultMessage : 'Revoked'
	},
	authentication_token_id:
	{
		id             : 'user.settings.authentication_token_id',
		description    : 'User account authentication tokens table id column header',
		defaultMessage : 'Token'
	},
	authentication_token_issued:
	{
		id             : 'user.settings.authentication_token_issued',
		description    : 'User account authentication tokens table issue date column header',
		defaultMessage : 'Issued'
	},
	authentication_token_status:
	{
		id             : 'user.settings.authentication_token_status',
		description    : 'User account authentication tokens table status column header',
		defaultMessage : 'Status'
	},
	authentication_token_latest_activity:
	{
		id             : 'user.settings.authentication_token_latest_activity',
		description    : 'User account authentication tokens table latest activity column header',
		defaultMessage : 'Activity'
	},
	show_advanced_settings:
	{
		id             : 'user.settings.show_advanced_settings',
		description    : 'Show user account\'s advanced settings',
		defaultMessage : 'Show advanced settings'
	},
	save_settings_failed:
	{
		id             : 'user.settings.could_not_save',
		description    : `Couldn't save new user's settings`,
		defaultMessage : `Couldn't save your settings`
	}
})

@preload((dispatch, get_state, location, parameters) =>
{
	return Promise.all
	([
		dispatch(get_user(get_state().authentication.user.id))
	])
})
@connect
(
	model =>
	({
		user                  : model.user_settings.user,
		authentication_tokens : model.user_settings.authentication_tokens,

		load_advanced_settings_error  : model.user_settings.load_advanced_settings_error,
		loading_advanced_settings     : model.user_settings.loading_advanced_settings,
		revoking_authentication_token : model.user_settings.revoking_authentication_token,
		saving_settings               : model.user_settings.saving_settings
	}),
	dispatch => bind_action_creators
	({
		// get_user,
		load_advanced_settings,
		get_user_authentication_tokens,
		revoke_authentication_token,
		change_email,
		dispatch
	},
	dispatch)
)
@international()
export default class Settings_page extends Component
{
	static propTypes =
	{
		user                  : PropTypes.object.isRequired,
		authentication_tokens : PropTypes.array,

		// get_user : PropTypes.func.isRequired,

		load_advanced_settings        : PropTypes.func.isRequired,
		loading_advanced_settings     : PropTypes.bool,
		load_advanced_settings_error  : PropTypes.any,

		get_user_authentication_tokens : PropTypes.func.isRequired,

		revoke_authentication_token   : PropTypes.func.isRequired,
		revoking_authentication_token : PropTypes.bool,
		change_email                  : PropTypes.func.isRequired,
		saving_settings               : PropTypes.bool
	}

	state = {}

	constructor(props, context)
	{
		super(props, context)

		this.state.email = props.user.email

		this.revoke_authentication_token = this.revoke_authentication_token.bind(this)
		this.save_settings               = this.save_settings.bind(this)
		this.load_advanced_settings      = this.load_advanced_settings.bind(this)
	}

	render()
	{
		const
		{
			user,
			authentication_tokens,
			translate,
			saving_settings,
			// load_advanced_settings,
			loading_advanced_settings,
			load_advanced_settings_error,
			revoking_authentication_token
		}
		= this.props

		const
		{
			showing_advanced_settings
		}
		= this.state

		const markup = 
		(
			<div className="content  user-settings">
				{title(translate(messages.header))}

				{/* User's personal info */}
				<section
					className={classNames
					(
						'content-section'
					)}>

					{/* "Settings" */}
					<h2 className="content-section-header">
						{translate(messages.header)}
					</h2>

					{/* "Email" */}
					<label htmlFor="email">{translate(authentication_form_messages.email)}</label>

					{/* User's email */}
					<Text_input
						value={this.state.email}
						name="email"
						validate={this.validate_email_on_sign_in}
						on_change={email => this.setState({ email })}
						placeholder={translate(authentication_form_messages.email)}/>

					{/* Form actions */}
					<div className="form__actions">
						{/* "Save changes" */}
						<Button
							busy={saving_settings}
							action={this.save_settings}>
							{translate(default_messages.save)}
						</Button>
					</div>
				</section>

				<div className="background-section">
					{/* "Show advanced settings" */}
					{ !showing_advanced_settings && 
						<Button
							busy={loading_advanced_settings}
							action={this.load_advanced_settings}>
							{translate(messages.show_advanced_settings)}
						</Button>
					}

					{/* Error while loading advanced settings */}
					{ load_advanced_settings_error &&
						<div className="error">{translate(default_messages.error)}</div>
					}
				</div>

				{/* Authentication tokens */}
				{ showing_advanced_settings &&
					<section
						className={classNames
						(
							'content-section'
						)}>

						{/* "Authentication tokens" */}
						<h2 style={style.header}>{translate(messages.authentication_tokens)}</h2>

						{/* Authentication tokens table */}
						<table>
							<thead>
								<tr>
									<th>{translate(messages.authentication_token_id)}</th>
									<th>{translate(messages.authentication_token_issued)}</th>
									<th>{translate(messages.authentication_token_status)}</th>
									<th>{translate(messages.authentication_token_latest_activity)}</th>
								</tr>
							</thead>

							<tbody>
								{authentication_tokens.map((token, token_index) =>
								{
									const markup =
									(
										<tr key={token_index}>
											{/* Token id */}
											<td>{token.id}</td>

											{/* Token issued on */}
											<td>
												<React_time_ago date={token.created}/>
											</td>

											{/* Token status (valid, revoked) */}
											<td>
												{/* If the token was revoked, show revocation date */}
												{token.revoked &&
													<span>
														{/* "Revoked" */}
														{translate(messages.authentication_token_revoked)}
														{/* when */}
														<React_time_ago date={token.revoked}/>
													</span>
												}

												{/* If the token wasn't revoked then it's valid */}
												{!token.revoked &&
													<span>
														{/* "Valid" */}
														{translate(messages.authentication_token_valid)}

														{/* "Revoke" */}
														<Button
															busy={revoking_authentication_token}
															action={() => this.revoke_authentication_token(token.id)}>
															{translate(messages.revoke_authentication_token)}
														</Button>
													</span>
												}
											</td>

											{/* Latest activity */}
											<td>
												{/* For each different IP address show latest activity time */}
												<ul>
													{token.history.map((activity, activity_index) =>
													{
														{/* Latest activity time for this IP address */}
														return <li key={activity_index}>
															{/* IP address, also resolving city and country */}
															{activity.ip} (city, country),
															{/* Latest activity time */}
															<React_time_ago date={activity.time}/>
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
				}
			</div>
		)

		return markup
	}

	async revoke_authentication_token(id)
	{
		try
		{
			await this.props.revoke_authentication_token(id)
		}
		catch (error)
		{
			return alert(this.props.translate(messages.revoke_authentication_token_failed))
		}

		this.props.get_user_authentication_tokens()
	}

	async save_settings()
	{
		try
		{
			// const settings =
			// {
			// }

			await this.props.change_email(this.state.email)
		}
		catch (error)
		{
			console.error(error)
			return alert(this.props.translate(messages.save_settings_failed))
		}

		// this.props.get_user(this.props.user.id)
	}

	async load_advanced_settings()
	{
		try
		{
			this.props.dispatch({ type: 'user settings: load advanced settings pending' })

			await this.props.get_user_authentication_tokens()
			
			this.props.dispatch({ type: 'user settings: load advanced settings done' })
			this.setState({ showing_advanced_settings: true })
		}
		catch (error)
		{
			console.error(error)
			this.props.dispatch({ type: 'user settings: load advanced settings failed', error: true })
		}
	}
}

const style = styler
`
`