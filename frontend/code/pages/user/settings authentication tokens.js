import React, { Component, PropTypes } from 'react'
import styler                          from 'react-styling'
import classNames                      from 'classnames'
import { defineMessages }              from 'react-intl'
import { connect }                     from 'react-redux'

import { bindActionCreators as bind_action_creators } from 'redux'

import international from '../../international/internationalize'

import Button          from '../../components/button'
import Content_section from '../../components/content section'
import Time_ago        from '../../components/time ago'

import
{
	get_user_authentication_tokens,
	revoke_authentication_token
}
from '../../actions/user/settings/main'

const messages = defineMessages
({
	authentication_tokens:
	{
		id             : 'user.settings.authentication_tokens',
		description    : 'User account authentication tokens',
		defaultMessage : 'Authentication tokens'
	},
	revoke_authentication_token:
	{
		id             : 'user.settings.authentication_token.revoke',
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
		id             : 'user.settings.authentication_token.valid',
		description    : 'User account authentication token valid status',
		defaultMessage : 'Valid'
	},
	authentication_token_revoked:
	{
		id             : 'user.settings.authentication_token.revoked',
		description    : 'User account authentication token revoked status',
		defaultMessage : 'Revoked'
	},
	authentication_token_id:
	{
		id             : 'user.settings.authentication_token.id',
		description    : 'User account authentication tokens table id column header',
		defaultMessage : 'Token'
	},
	authentication_token_issued:
	{
		id             : 'user.settings.authentication_token.issued',
		description    : 'User account authentication tokens table issue date column header',
		defaultMessage : 'Issued'
	},
	authentication_token_status:
	{
		id             : 'user.settings.authentication_token.status',
		description    : 'User account authentication tokens table status column header',
		defaultMessage : 'Status'
	},
	authentication_token_latest_activity:
	{
		id             : 'user.settings.authentication_token.latest_activity',
		description    : 'User account authentication tokens table latest activity column header',
		defaultMessage : 'Activity'
	},
	currently_used_hint:
	{
		id             : 'user.settings.authentication_token.currently_used_hint',
		description    : 'Describes the user what does "currently_used" token mean',
		defaultMessage : `You're currently using this authentication token`
	}
})

@connect
(
	model =>
	({
		authentication_tokens         : model.user_settings.main.authentication_tokens,
		revoking_authentication_token : model.user_settings.main.revoking_authentication_token
	}),
	{
		get_user_authentication_tokens,
		revoke_authentication_token
	}
)
@international()
export default class Authentication_tokens extends Component
{
	static propTypes =
	{
		revoke_authentication_token   : PropTypes.func.isRequired,
		revoking_authentication_token : PropTypes.bool
	}

	constructor(props, context)
	{
		super(props, context)

		this.revoke_authentication_token = this.revoke_authentication_token.bind(this)
	}

	render()
	{
		const { authentication_tokens, revoking_authentication_token, translate } = this.props

		const markup =
		(
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
									'background-color--gray-color-lightest' : token.revoked_at,
									// 'background-color--base-color-lightest' : token.currently_used
								})}
								style={token.revoked_at ? style.authentication_token.revoked : style.authentication_token}>

								{/* Divider line */}
								{ token_index > 0 && <div className="content-section-divider"/> }

								{/* Token id */}
								<div style={style.authentication_token.id}>
									{/* "Token" */}
									{translate(messages.authentication_token_id)}
									{' '}
									<code>{token.id}</code>

									{/* Indicate if the token is being currently used (graphical) */}
									{token.currently_used &&
										<div
											title={translate(messages.currently_used_hint)}
											className="background-color--base-color"
											style={style.authentication_token.currently_used}/>
									}
								</div>

								{/* Token issued on */}
								<div>
									{/* "Issued" */}
									{translate(messages.authentication_token_issued)}
									{' '}
									{/* when */}
									<Time_ago style={style.authentication_token.issued}>{token.created_at}</Time_ago>
								</div>

								{/* Token status (valid, revoked) */}
								{!token.currently_used &&
									<div style={style.authentication_token.status}>
										{/* If the token was revoked, show revocation date */}
										{token.revoked_at &&
											<span>
												{/* "Revoked" */}
												{translate(messages.authentication_token_revoked)}
												{' '}
												{/* when */}
												<Time_ago>{token.revoked_at}</Time_ago>
											</span>
										}

										{/* If the token wasn't revoked then it's valid */}
										{!token.revoked_at &&
											<span>
												{/* "Valid" */}
												{translate(messages.authentication_token_valid)}
												{' '}
												{/* "Revoke" */}
												{/* (if this token is not being currently used) */}
												{!token.currently_used &&
													<Button
														busy={revoking_authentication_token}
														action={() => this.revoke_authentication_token(token.id)}>
														{translate(messages.revoke_authentication_token)}
													</Button>
												}
											</span>
										}
									</div>
								}

								{/* Latest activity */}
								<div>
									{/* "Latest activity" */}
									{translate(messages.authentication_token_latest_activity)}:

									{/* For each different IP address show latest activity time */}
									<ul style={style.authentication_token.latest_activity}>
										{token.history.map((activity, activity_index) =>
										{
											{/* Latest activity time for this IP address */}
											return <li key={activity_index}>
												{/* IP address, also resolving city and country */}
												<code>{activity.ip}</code>{/* (city, country)*/},
												{' '}
												{ activity.place && activity.place.city && `${activity.place.city}, ${activity.place.country}, ` }
												{' '}
												{/* Latest activity time */}
												<Time_ago>{activity.updated_at}</Time_ago>
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
		)

		return markup
	}

	async revoke_authentication_token(id)
	{
		const { revoke_authentication_token, get_user_authentication_tokens, translate } = this.props

		try
		{
			await revoke_authentication_token(id)
		}
		catch (error)
		{
			return alert(translate(messages.revoke_authentication_token_failed))
		}

		get_user_authentication_tokens()
	}
}

const style = styler
`
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

		id
			position : relative

		currently_used
			position : absolute
			top : 0.5em
			right : 0

			display : block
			width  : 0.5em
			height : 0.5em
			border-radius : 50%
`
