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
	change_email
}
from '../../actions/user settings'

import { messages as authentication_form_messages } from '../../components/authentication form'
import default_messages from '../../components/messages'

import Text_input      from '../../components/text input'
import Button          from '../../components/button'
import Content_section from '../../components/content section'
import Editable_field  from '../../components/editable field'
import Modal           from '../../components/modal'
import Steps           from '../../components/steps'

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
	},

	// Change password popup
	change_password:
	{
		id             : 'user.settings.password.change',
		description    : `Change user's own password popup title`,
		defaultMessage : `Change password`
	},
	current_password:
	{
		id             : 'user.settings.password.current',
		description    : `User's current password`,
		defaultMessage : `Change password`
	},
	new_password:
	{
		id             : 'user.settings.password.new',
		description    : `User's new password`,
		defaultMessage : `New password`
	},
	enter_current_password:
	{
		id             : 'user.settings.password.enter_current',
		description    : `An invitation for a user to enter his current password`,
		defaultMessage : `Enter you current password`
	},
	enter_new_password:
	{
		id             : 'user.settings.password.enter_new',
		description    : `An invitation for a user to enter a new password`,
		defaultMessage : `Enter new password`
	},
	enter_new_password_again:
	{
		id             : 'user.settings.password.enter_new_again',
		description    : `An invitation for a user to enter a new password again`,
		defaultMessage : `Enter new password again`
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
	dispatch =>
	({
		dispatch,
		...bind_action_creators
		({
			get_user_authentication_tokens,
			revoke_authentication_token,
			change_email
		},
		dispatch)
	})
)
@international()
export default class Settings_page extends Component
{
	static propTypes =
	{
		user                  : PropTypes.object.isRequired,
		authentication_tokens : PropTypes.array,

		// get_user : PropTypes.func.isRequired,

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

		this.revoke_authentication_token = this.revoke_authentication_token.bind(this)
		this.save_settings               = this.save_settings.bind(this)
		this.load_advanced_settings      = this.load_advanced_settings.bind(this)
		this.change_password             = this.change_password.bind(this)
		this.cancel_change_password      = this.cancel_change_password.bind(this)
		this.change_password_steps_next  = this.change_password_steps_next.bind(this)
	}

	render()
	{
		const
		{
			user,
			authentication_tokens,
			translate,
			saving_settings,
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

				<div className="row row--content-sections">
					<div className="column-l-6-of-12">
						{/* User's personal info */}

						{/* "Settings" */}
						<Content_section
							title={translate(messages.header)}
							busy={saving_settings}>

							{/* User's email */}
							<Editable_field
								name="email"
								email={true}
								label={translate(authentication_form_messages.email)}
								value={user.email}
								validate={this.validate_email}
								on_save={value => alert('work in progress: save ' + value)}/>

							{/* User's password */}
							<Editable_field
								name="password"
								password={true}
								label={translate(authentication_form_messages.password)}
								on_edit={this.change_password}/>
						</Content_section>
					</div>
				</div>

				{/* Change password popup */}
				<Modal
					title={translate(messages.change_password)}
					isOpen={this.state.change_password}
					onRequestClose={this.cancel_change_password}
					actions=
					{[{
						action : this.change_password_steps_next,
						text   : translate(default_messages.next)
					}]}>

					{/* Change password steps */}
					<Steps ref="change_password_steps">
						{/* Enter current password */}
						<Change_password_step_1 step={1}/>

						{/* Enter new password */}
						<Change_password_step_2 step={2}/>

						{/* Enter new password again */}
						<Change_password_step_3 step={3}/>
					</Steps>
				</Modal>

				<div className="row row--content-sections">
					<div className="column-l-6-of-12">
						<div className="background-section">
							{/* "Show advanced settings" */}
							{ !showing_advanced_settings && 
								<Button
									busy={loading_advanced_settings}
									action={this.load_advanced_settings}
									style={style.show_advanced_settings}>
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
							<Content_section
								title={translate(messages.authentication_tokens)}
								padding={false}>

								{/* Authentication tokens list */}
								<ul>
									{authentication_tokens.map((token, token_index) =>
									{
										const markup =
										(
											<li
												key={token_index}
												className={classNames('content-section-padding',
												{
													'background-color--gray-color-lightest': token.revoked
												})}
												style={token.revoked ? style.authentication_token.revoked : style.authentication_token}>

												{/* Divider line */}
												{ token_index > 0 && <div className="content-section-divider"/> }

												{/* Token id */}
												<div>
													{/* "Token" */}
													{translate(messages.authentication_token_id)}
													{' '}
													<code>{token.id}</code>
												</div>

												{/* Token issued on */}
												<div>
													{/* "Issued" */}
													{translate(messages.authentication_token_issued)}
													{' '}
													{/* when */}
													<React_time_ago
														date={token.created}
														style={style.authentication_token.issued}/>
												</div>

												{/* Token status (valid, revoked) */}
												<div style={style.authentication_token.status}>
													{/* If the token was revoked, show revocation date */}
													{token.revoked &&
														<span>
															{/* "Revoked" */}
															{translate(messages.authentication_token_revoked)}
															{' '}
															{/* when */}
															<React_time_ago date={token.revoked}/>
														</span>
													}

													{/* If the token wasn't revoked then it's valid */}
													{!token.revoked &&
														<span>
															{/* "Valid" */}
															{translate(messages.authentication_token_valid)}
															{' '}
															{/* "Revoke" */}
															<Button
																busy={revoking_authentication_token}
																action={() => this.revoke_authentication_token(token.id)}>
																{translate(messages.revoke_authentication_token)}
															</Button>
														</span>
													}
												</div>

												{/* Latest activity */}
												<div>
													{/* "Latest activity" */}
													{translate(messages.authentication_token_latest_activity)}:

													{/* For each different IP address show latest activity time */}
													<ul style={style.authentication_token.latest_activity}>
														{token.history.sort((a, b) => b.time.getTime() - a.time.getTime()).map((activity, activity_index) =>
														{
															{/* Latest activity time for this IP address */}
															return <li key={activity_index}>
																{/* IP address, also resolving city and country */}
																<code>{activity.ip}</code>{/* (city, country)*/},
																{' '}
																{ activity.place && activity.place.city && `${activity.place.city}, ${activity.place.country}, ` }
																{' '}
																{/* Latest activity time */}
																<React_time_ago date={activity.time}/>
															</li>
														})}
													</ul>
												</div>
											</li>
										)

										return markup
									})}
								</ul>
							</Content_section>
						}
					</div>
				</div>
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
		}
		catch (error)
		{
			console.error(error)
			return this.props.dispatch({ type: 'user settings: load advanced settings failed', error: true })
		}

		this.setState({ showing_advanced_settings: true })
	}

	validate_email(value)
	{
		if (!value)
		{
			return this.translate(authentication_form_messages.registration_email_is_required)
		}
	}

	validate_password(value)
	{
		if (!value)
		{
			return this.translate(authentication_form_messages.registration_password_is_required)
		}
	}

	change_password()
	{
		this.setState({ change_password: true })
	}

	cancel_change_password()
	{
		this.setState({ change_password: false })
	}

	change_password_steps_next()
	{
		this.refs.change_password_steps.next()
	}
}

const style = styler
`
	email
		width: 100%

	show_advanced_settings
		// margin-top: var(--content-section-padding)

	authentication_tokens

	authentication_token
		position    : relative
		// padding     : var(--content-section-padding)
		line-height : 1.6em

		&revoked
			// color: var(--gray-color-darker)
			// background-color: var(--gray-color-lightest)

		issued
			// display: block

		latest_activity

	change_button
		margin-left: 1em

	row
		display : flex
		margin-bottom : 1em

		&last
			margin-bottom : 0em
`

// Enter current password
@international()
class Change_password_step_1 extends Component
{
	render()
	{
		const { translate } = this.props

		const markup =
		(
			<div>
				<Text_input
					name="password"
					description={translate(messages.enter_current_password)}
					placeholder={translate(messages.current_password)}
					on_change={value => value}/>
			</div>
		)

		return markup
	}
}

// Enter new password
@international()
class Change_password_step_2 extends Component
{
	render()
	{
		const { translate } = this.props

		const markup =
		(
			<div>
				<Text_input
					name="password"
					description={translate(messages.enter_new_password)}
					placeholder={translate(messages.new_password)}
					on_change={value => value}/>
			</div>
		)

		return markup
	}
}


// Enter new password again
@international()
class Change_password_step_3 extends Component
{
	render()
	{
		const { translate } = this.props

		const markup =
		(
			<div>
				<Text_input
					name="password"
					description={translate(messages.enter_new_password_again)}
					placeholder={translate(messages.new_password)}
					on_change={value => value}/>
			</div>
		)

		return markup
	}
}
