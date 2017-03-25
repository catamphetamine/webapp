import React, { Component, PropTypes } from 'react'
import { Title, preload }              from 'react-isomorphic-render'
import { connect }                     from 'react-redux'
import styler                          from 'react-styling'
import classNames                      from 'classnames'
import { defineMessages }              from 'react-intl'
import { Button }                      from 'react-responsive-ui'

import international from '../../international/internationalize'

import http_status_codes from '../../tools/http status codes'

import
{
	get_user_authentication,
	get_user_access_tokens,
	set_load_advanced_settings_pending,
	set_load_advanced_settings_error,
	connector
}
from '../../redux/user/settings/main'

import
{
	get_self,
	connector as authentication_connector
}
from '../../redux/authentication'

import { snack } from '../../redux/snackbar'

import default_messages from '../../components/messages'
import Content_section from '../../components/content section'

import Change_email    from './settings change email'
import Change_password from './settings change password'
import Access_tokens   from './settings access tokens'

@preload(({ dispatch }) =>
{
	return Promise.all
	([
		dispatch(get_self()),
		dispatch(get_user_authentication())
	])
})
@connect
(
	({ authentication, user_settings }) =>
	({
		...authentication_connector(authentication),
		...connector(user_settings.main)
	}),
	{
		get_user_access_tokens,
		set_load_advanced_settings_pending,
		set_load_advanced_settings_error,
		snack
	}
)
@international
export default class Settings_page extends Component
{
	state = {}

	constructor()
	{
		super()

		this.load_advanced_settings = this.load_advanced_settings.bind(this)
	}

	render()
	{
		const
		{
			user,
			access_tokens,
			translate,
			load_advanced_settings_pending,
			load_advanced_settings_error,
			revoking_access_token
		}
		= this.props

		const
		{
			showing_advanced_settings
		}
		= this.state

		const markup =
		(
			<div className="content user-settings">
				{/* "Settings" */}
				<Title>{ translate(messages.header) }</Title>

				{/* General settings */}
				<div className="row sections">
					{/* User's personal info */}
					<div className="column-12-of-12 column-m-6-of-12">
						{/* "Settings" */}
						<Content_section
							title={ translate(messages.header) }>
							{/* User's email */}
							<Change_email/>
						</Content_section>
					</div>

					<div className="column-12-of-12 column-m-6-of-12">
						{/* "Authentication" */}
						<Content_section
							title={ translate(messages.authentication) }>

							{/* User's password */}
							<Change_password/>
						</Content_section>
					</div>
				</div>

				{/* Advanced settings */}
				<div className="row sections">
					<div className="column-12-of-12 column-l-6-of-12">
						{ /* "Show advanced settings" */ }
						{ !showing_advanced_settings &&
							<div className="background-section">
								{ /* "Show advanced settings" button */ }
								<Button
									busy={ load_advanced_settings_pending }
									action={ this.load_advanced_settings }
									style={ style.show_advanced_settings }>
									{ translate(messages.show_advanced_settings) }
								</Button>

								{ /* Error while loading advanced settings */ }
								{ load_advanced_settings_error &&
									<div className="error">
										{ translate(default_messages.error) }
									</div>
								}
							</div>
						}

						{ /* Authentication tokens */ }
						{ showing_advanced_settings &&
							<Access_tokens/>
						}
					</div>
				</div>
			</div>
		)

		return markup
	}

	async load_advanced_settings()
	{
		const
		{
			set_load_advanced_settings_pending,
			set_load_advanced_settings_error,
			get_user_access_tokens
		}
		= this.props

		try
		{
			set_load_advanced_settings_error()
			set_load_advanced_settings_pending(true)
			await get_user_access_tokens()
		}
		catch (error)
		{
			console.error(error)
			return set_load_advanced_settings_error(error)
		}
		finally
		{
			set_load_advanced_settings_pending(false)
		}

		this.setState({ showing_advanced_settings: true })
	}
}

const style = styler
`
`

const messages = defineMessages
({
	header:
	{
		id             : 'user.settings.header',
		description    : 'User account settings page header',
		defaultMessage : 'Settings'
	},
	authentication:
	{
		id             : 'user.settings.authentication',
		description    : 'User account settings page authentication section header',
		defaultMessage : 'Authentication'
	},
	show_advanced_settings:
	{
		id             : 'user.settings.show_advanced_settings',
		description    : 'Show user account\'s advanced settings',
		defaultMessage : 'Show advanced settings'
	},
	change_email_failed:
	{
		id             : 'user.settings.could_not_change_email',
		description    : `Couldn't change user's email to a new one`,
		defaultMessage : `Couldn't change your email`
	},
	save_settings_failed:
	{
		id             : 'user.settings.could_not_save',
		description    : `Couldn't save new user's settings`,
		defaultMessage : `Couldn't save your settings`
	}
})