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
	get_user_self,
	get_user_authentication,
	get_user_authentication_tokens,
	change_alias,
	reset_change_alias_error,
	set_load_advanced_settings_pending,
	set_load_advanced_settings_error,
	connector
}
from '../../redux/user/settings/main'

import { snack } from '../../redux/snackbar'

import default_messages from '../../components/messages'

import Content_section from '../../components/content section'
import Editable_field  from '../../components/editable field'

import Change_email    from './settings change email'
import Change_password from './settings change password'
import Authentication_tokens from './settings authentication tokens'

@preload(({ dispatch }) =>
{
	return Promise.all
	([
		dispatch(get_user_self()),
		dispatch(get_user_authentication())
	])
})
@connect
(
	({ user_settings }) =>
	({
		...connector(user_settings.main)
	}),
	{
		get_user_authentication_tokens,
		change_alias,
		reset_change_alias_error,
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

		this.load_advanced_settings   = this.load_advanced_settings.bind(this)
		this.update_alias             = this.update_alias.bind(this)
		this.validate_alias           = this.validate_alias.bind(this)
		this.reset_change_alias_error = this.reset_change_alias_error.bind(this)
	}

	reset_change_alias_error()
	{
		const { reset_change_alias_error } = this.props

		reset_change_alias_error()
	}

	change_alias_error_message(error)
	{
		const { translate } = this.props

		if (!error)
		{
			return
		}

		if (error.status === http_status_codes.Conflict)
		{
			return translate(messages.alias_already_taken)
		}

		if (error.message === 'Invalid alias')
		{
			return translate(messages.invalid_alias)
		}

		if (error.message === 'Max aliases reached')
		{
			return translate(messages.max_aliases_reached)
		}

		return translate(messages.change_alias_failed)
	}

	render()
	{
		const
		{
			user,
			authentication_tokens,
			translate,
			change_alias_pending,
			change_alias_error,
			load_advanced_settings_pending,
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

							{/* Alias */}
							<Editable_field
								name="alias"
								label={ translate(messages.alias) }
								hint={ translate(messages.alias_hint) }
								value={ user.alias }
								validate={ this.validate_alias }
								save={ this.update_alias }
								cancel={ this.reset_change_alias_error }
								error={ this.change_alias_error_message(change_alias_error) }/>

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
							<Authentication_tokens/>
						}
					</div>
				</div>
			</div>
		)

		return markup
	}

	validate_alias(value)
	{
		const { translate } = this.props

		if (!value)
		{
			return translate(messages.enter_alias)
		}
	}

	async update_alias(alias)
	{
		try
		{
			const { change_alias, translate, snack } = this.props

			await change_alias(alias)

			snack(translate(messages.alias_updated))
		}
		catch (error)
		{
			console.error(error)
			throw error
		}
	}

	async load_advanced_settings()
	{
		const
		{
			set_load_advanced_settings_pending,
			set_load_advanced_settings_error,
			get_user_authentication_tokens
		}
		= this.props

		try
		{
			set_load_advanced_settings_error()
			set_load_advanced_settings_pending(true)
			await get_user_authentication_tokens()
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
	email
		width: 100%

	show_advanced_settings
		// margin-top: var(--content-section-padding)

	change_button
		margin-left: 1em
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
	},
	alias:
	{
		id             : 'user.settings.alias',
		description    : `User's alias, which is a unique human-readable identifier used in user's URL`,
		defaultMessage : `Alias`
	},
	alias_hint:
	{
		id             : 'user.settings.alias.hint',
		description    : `A hint on user's alias, which is a unique human-readable identifier used in user's URL`,
		defaultMessage : `An "alias" is a unique textual identifier used as part of your profile page URL`
	},
	enter_alias:
	{
		id             : 'user.settings.alias.required',
		description    : `An error message stating that new alias hasn't been entered`,
		defaultMessage : `Enter alias`
	},
	alias_updated:
	{
		id             : 'user.settings.alias.updated',
		description    : `User's new alias has been saved`,
		defaultMessage : `Alias updated`
	},
	change_alias_failed:
	{
		id             : 'user.settings.alias.update_failed',
		description    : `An error stating that the user's alias couldn't be changed to the new one`,
		defaultMessage : `Couldn't update your alias`
	},
	alias_already_taken:
	{
		id             : 'user.settings.alias.already_taken',
		description    : `An error stating that the desired alias is already taken`,
		defaultMessage : `This alias is already taken`
	},
	invalid_alias:
	{
		id             : 'user.settings.alias.invalid',
		description    : `An error stating that the desired alias is invalid (maybe is digits-only, or something else)`,
		defaultMessage : `Not a valid alias`
	},
	max_aliases_reached:
	{
		id             : 'user.settings.alias.max_aliases_reached',
		description    : `An error stating that the user has occupied too much aliases and more aliases per user aren't allowed`,
		defaultMessage : `You have already too many aliases`
	}
})