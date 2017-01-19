import React, { Component, PropTypes } from 'react'
import { title, preload }              from 'react-isomorphic-render'
import { connect }                     from 'react-redux'
import styler                          from 'react-styling'
import classNames                      from 'classnames'
import { defineMessages }              from 'react-intl'

import { bindActionCreators as bind_action_creators } from 'redux'

import international from '../../international/internationalize'

import http_status_codes from '../../tools/http status codes'

import
{
	get_user,
	get_user_authentication_tokens,
	change_alias
}
from '../../actions/user/settings/main'

import default_messages from '../../components/messages'

import { Button } from 'react-responsive-ui'

import Content_section from '../../components/content section'
import Editable_field  from '../../components/editable field'

import Change_email    from './settings change email'
import Change_password from './settings change password'
import Authentication_tokens from './settings authentication tokens'

const messages = defineMessages
({
	header:
	{
		id             : 'user.settings.header',
		description    : 'User account settings page header',
		defaultMessage : 'Settings'
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

@preload(({ dispatch, getState }) => dispatch(get_user(getState().authentication.user.id)))
@connect
(
	state =>
	({
		user : state.user_settings.main.user,

		load_advanced_settings_error   : state.user_settings.main.load_advanced_settings_error,
		load_advanced_settings_pending : state.user_settings.main.load_advanced_settings_pending,

		change_alias_pending : state.user_settings.main.change_alias_pending,
		change_alias_error   : state.user_settings.main.change_alias_error
	}),
	dispatch =>
	({
		dispatch,
		...bind_action_creators
		({
			get_user_authentication_tokens,
			change_alias
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

		change_alias_pending : PropTypes.bool,
		change_alias_error   : PropTypes.object
	}

	state = {}

	constructor(props, context)
	{
		super(props, context)

		this.load_advanced_settings   = this.load_advanced_settings.bind(this)
		this.update_alias             = this.update_alias.bind(this)
		this.validate_alias           = this.validate_alias.bind(this)
		this.reset_change_alias_error = this.reset_change_alias_error.bind(this)
	}

	reset_change_alias_error()
	{
		this.props.dispatch({ type: 'user settings: change alias: reset error' })
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
				{title(translate(messages.header))}

				{/* General settings */}
				<div className="row row--content-sections">
					<div className="column-l-6-of-12">
						{/* User's personal info */}

						{/* "Settings" */}
						<Content_section
							title={translate(messages.header)}>

							{/* Alias */}
							<Editable_field
								name="alias"
								label={translate(messages.alias)}
								hint={translate(messages.alias_hint)}
								value={user.alias}
								validate={this.validate_alias}
								save={this.update_alias}
								cancel={this.reset_change_alias_error}
								error={this.change_alias_error_message(change_alias_error)}/>

							{/* User's email */}
							<Change_email/>

							{/* User's password */}
							<Change_password/>
						</Content_section>
					</div>
				</div>

				{/* Aadvanced settings */}
				<div className="row row--content-sections">
					<div className="column-l-6-of-12">
						{/* "Show advanced settings" */}
						{ !showing_advanced_settings &&
							<div className="background-section">
								{/* "Show advanced settings" button */}
								{ !showing_advanced_settings &&
									<Button
										busy={load_advanced_settings_pending}
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
						}

						{/* Authentication tokens */}
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
		if (!value)
		{
			return this.props.translate(messages.enter_alias)
		}
	}

	async update_alias(alias)
	{
		const { change_alias, translate, dispatch } = this.props

		await change_alias(alias)

		dispatch({ type: 'snack', snack: translate(messages.alias_updated) })
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
